import fastify from 'fastify';
import fastifyMetrics from 'fastify-metrics';
import Database from 'better-sqlite3/lib/database.js';
import bcrypt from 'bcrypt';
import fastifyOauth2 from '@fastify/oauth2';
import dotenv from 'dotenv';
import jwt from '@fastify/jwt';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
//import sget from 'simple-get';

dotenv.config();

const FRONT = process.env.FRONT_URL

// Configuration du logger fastify
// const loggerConfig = {
//     transport: {
//         target: 'pino/file',
//         options: {
//             destination: '/var/log/app/auth-service.log',
//             mkdir: true
//         }
//     },
//     redact: ['password', 'hash', 'JWT_SECRET', 'uuid'],
//     base: { service: 'auth'},
//     formatters: { time: () => `,"timestamp":"${new Date().toISOString()}"` }
// }

// const app = fastify({ logger: loggerConfig });
const app = fastify({ logger: true });

await app.register(fastifyMetrics, { endpoint: '/metrics' });


await app.register(jwt, {
  secret: process.env.JWT_SECRET,
  sign: { expiresIn: '2h' }
});

// Creation de la db et de la table 
const db = new Database('./data/user.sqlite');

const user = `
    CREATE TABLE IF NOT EXISTS user (
        uuid TEXT PRIMARY KEY,
        google_id TEXT,
        discord_id TEXT,
        username TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        avatar TEXT,
        twofa_enabled INTEGER DEFAULT 1,
        twofa_code TEXT,
        twofa_expiry DATETIME
    );
`
db.exec(user);

app.addHook('onClose', async (instance) => {
  db.close();
});

app.post('/register', async (request, reply) => {
    const { username, email, password } = request.body;
    const uuid = crypto.randomUUID();
    
    try {
        const validationPassword = (password) => {
            return /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);
        };
        if (!validationPassword(password)) {
            request.log.warn({
                event: 'register_attempt',
                user: { email }
            }, 'Registration failed: invalid password');
            return reply.code(400).send({
                error: 'Password must be at least 8 characters, include one uppercase letter, one number, and one special character.'
            });
        }
        const hash = await bcrypt.hash(password, 10);

        const validationEmail = (email) => {
            return /^[^@]+@[^@]+\.[^@]+$/i.test(email);
        };
        if (!validationEmail(email)) {
            request.log.warn({
                event: 'register_attempt',
                user: { email }
            }, 'Registration failed: invalid email');
            return reply.code(400).send({
                error: 'Invalid email'
            });
        }
        const emailExist = db.prepare('SELECT email FROM user WHERE email = ?').get(email);
        if (emailExist) {
            request.log.warn({
                event: 'register_attempt',
                user: { email }
            }, 'Registration failed: email already in use');
            return reply.code(400).send({
                error: 'Email already in use'
            });
        }

        const info = { uuid, username, email, hash }

        const { jwtToken, refreshToken } = await generateTokens(uuid, username, email);
        // const token = await app.jwt.sign({ uuid: uuid, username: username, email: email })
        
        const response = await fetch('http://user:4000/insert', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-internal-key': process.env.JWT_SECRET //cela permet a ce que seul un service ayant cette cle peut avoir accees a cette methode
            },
            body: JSON.stringify(info)
        });

        if (!response.ok)
            throw new Error(`HTTP error! status: ${response.status}`);
        
        db.prepare('INSERT INTO user (uuid, username, email, password, avatar) VALUES (?, ?, ?, ?, ?)').run(uuid, username, email, hash, '');
        request.log.info({
            event: 'register_attempt',
            user: { email }
        }, 'Registration success');
        reply.code(201).send({ success: true, token: jwtToken, refreshToken});
    } catch (err) {
        request.log.error({
            error: {
                message: err.message,
                code: err.code
            },
            user: { email, username },
            event: 'registration_attempt'
        }, 'Login failed with error');
        reply.code(500).send({ error: 'Internal Server Error' });
    }
});

app.post('/login', async (request, reply) => {
    const { email, password } = request.body;

    try{
        const user = db.prepare('SELECT * FROM user WHERE email = ?').get(email);
        if (!user) {
            request.log.warn({
                event: 'login_attempt',
                user: { email }
            }, 'Login failed: user not found');
            return reply.code(401).send({ error: 'Invalid identifiers or password'});
        }

        if (!user.password) {
            request.log.warn({
                event: 'login_attempt',
                user: { email }
            }, 'Login failed: OAuth user trying password login');
            return reply.code(401).send({ error: 'Invalid identifier or password'});
        }
        const pass = await bcrypt.compare(password, user.password);
        if (!pass) {
            request.log.warn({
                event: 'login_attempt',
                user: { email }
            }, 'Login failed: wrong password');
            return reply.code(401).send({ error: 'Invalid identifier or password'});
        }

        // const is2FAEnabled = user.twofa_enabled === 1;
        // if (is2FAEnabled) {
        //     const code = createCode(user.uuid);

        //     const emailResult = await send2FACode(email, code);
        //     if (!emailResult.success) {
        //         request.log.error({
        //             event: 'login_attempt',
        //             user: { email },
        //             error: emailResult.error
        //         }, 'Login failed: unable to send 2FA code');
        //         return reply.code(500).send({ error: 'Unable to send 2FA code' });
        //     }
            
        //     return reply.send({ uuid: user.uuid });
        // }

        const info = { online: 1, uuid: user.uuid }
        const response = await fetch('http://user:4000/online', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-internal-key': process.env.JWT_SECRET //cela permet a ce que seul un service ayant cette cle peut avoir accees a cette methode
            },
            body: JSON.stringify(info)
        });

        if (!response.ok)
            throw new Error(`HTTP error! status: ${response.status}`);

        //const { jwtToken, refreshToken } = await generateTokens(uuid, username, email);
        const { jwtToken, refreshToken } = await generateTokens(user.uuid, user.username, user.email);
        // const jwtToken = await app.jwt.sign({ userId: user.uuid, email: user.email, username: user.username  });
        request.log.info({
            event: 'login_attempt',
            user: { email }
        }, 'Login success');

        reply.send({ jwtToken, refreshToken })
    }catch (err) {
        request.log.error({
            error: {
                message: err.message,
                code: err.code
            },
            user: { email, username },
            event: 'login_attempt'
        }, 'Login failed with error');
        reply.code(500).send({ error: 'Internal Server Error' });

    }
});

app.post('/verify-2fa', async (request, reply) => {
    const { uuid, code } = request.body;
    
    try {
        const user = db.prepare('SELECT * FROM user WHERE uuid = ?').get(uuid);
        if (!user) {
            request.log.warn({
                event: '2fa_verification_attempt',
                user: { uuid }
            }, '2FA verification failed: user not found');
            return reply.code(401).send({ error: 'Invalid user' });
        }
        
        if (user.twofa_code !== code || new Date() > new Date(user.twofa_expiry)) {
            request.log.warn({
                event: '2fa_verification_attempt',
                user: { uuid }
            }, '2FA verification failed: invalid or expired code');
            return reply.code(401).send({ error: 'Invalid or expired 2FA code' });
        }

        // Réinitialiser le code 2FA après une vérification réussie
        db.prepare('UPDATE user SET twofa_code = NULL, twofa_expiry = NULL WHERE uuid = ?').run(uuid);

        const info = { online: 1, uuid: user.uuid }
        const response = await fetch('http://user:4000/online', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-internal-key': process.env.JWT_SECRET //cela permet a ce que seul un service ayant cette cle peut avoir accees a cette methode
            },
            body: JSON.stringify(info)
        });

        if (!response.ok)
            throw new Error(`HTTP error! status: ${response.status}`);

        const { jwtToken, refreshToken } = await generateTokens(uuid, user.username, user.email);

        request.log.info({
            event: '2fa_verification_attempt',
            user: { uuid }
        }, '2FA verification success');

        console.log(jwtToken, refreshToken);
        reply.send({ jwtToken, refreshToken });
    } catch (err) {
        request.log.error({
            error: {
                message: err.message,
                code: err.code
            },
            user: { uuid },
            event: '2fa_verification_attempt'
        }, '2FA verification failed with error');
        reply.code(500).send({ error: 'Internal Server Error' });
    }
});

function createCode(uuid) {
    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Le code expire dans 10 minutes

    db.prepare('UPDATE user SET twofa_code = ?, twofa_expiry = ? WHERE uuid = ?').run(code, expiresAt.toISOString(), uuid);
    return code;
}

// Configuration du transporteur nodemailer
const transporter = nodemailer.createTransport({
    port: process.env.SMTP_PORT, 
    host: process.env.SMTP_HOST, // true pour 465, false pour les autres ports
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

async function send2FACode(email, code) {
    const mailOptions = {
        from: `"${process.env.APP_NAME}" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Your 2FA Code',
        text: `Your 2FA code is: ${code}. It will expire in 10 minutes.`
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

app.patch('/update-password', async(request, reply) => {
    const { oldPassword, newPassword } = request.body;
    let uuid;

    try{
        uuid = checkToken(request);
    } catch (err) {
        request.log.warn({
            event: 'update-password_attempt',
            error: err.message
        }, 'Password Update failed: Unauthorized checkToken attemp');
        return reply.code(401).send({ error: 'Unauthorized' });
    }

    if (!oldPassword || !newPassword){
        request.log.warn({
            event: 'update-password_attempt'
        }, 'Password Update failed: Missing passwords');
        return reply.code(400).send({ error: 'Missing passwords' });
    }

    const user = db.prepare('SELECT * FROM user WHERE uuid = ?').get(uuid);
    if (!user) {
        request.log.warn({
            event: 'update-password_attempt'
        }, 'Password Update failed: User not found in SQL database');
        return reply.code(401).send({ error: 'User not found' });
    }

    const userContext = { uuid: user.uuid, email: user.emmail };

    if (!user.password) {
        request.log.warn({
            event: 'update-password_attempt',
            user: userContext
        }, 'Password Update failed: OAuth User');
        return reply.code(401).send({ error: 'user registered with google or github'});
    }
    const pass = await bcrypt.compare(oldPassword, user.password);
    if (!pass) {
        request.log.warn({
            event: 'update-password_attempt',
            user: userContext
        }, 'Password Update failed: Old password dismatch');
        return reply.code(401).send({ error: 'Old Password dismatch' });
    }

    const validationPassword = (password) => {
        return /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);
    };
    if (!validationPassword(newPassword)) {
        request.log.warn({
            event: 'update-password_attempt',
            user: userContext
        }, 'Password Update failed: Invalid password format');
        return reply.code(400).send({
            error: 'Password must be at least 8 characters, include one uppercase letter, one number, and one special character.'
        });
    }
    try {
        const hash = await bcrypt.hash(newPassword, 10);
        db.prepare('UPDATE user set password = ? WHERE uuid = ?').run(hash, uuid);
        request.log.info({
            event: 'update-password_attempt',
            user: userContext
        }, 'Password updated success');
        reply.send('Password update');
    } catch (err) {
        request.log.error({
            error: {
                message: err.message,
                code: err.code
            },
            user: { email, username },
            event: 'update-password_attempt'
        }, 'Update Password error');
        reply.code(500).send({ error: 'Internal Server Error' });
    }
}); 

app.register(fastifyOauth2, {
    name: 'google',
    scope: ['email', 'profile'],
    credentials: {
        client: {
            id: process.env.GOOGLE_CLIENT_ID,
            secret: process.env.GOOGLE_CLIENT_SECRET
        },
        auth : fastifyOauth2.GOOGLE_CONFIGURATION
        /*utilise la configuration predefinie pour google, ca vaut ca en general:
        tokenHost: 'https://accounts.google.com',
        authorizePath: '/o/oauth2/v2/auth',
        tokenPath: '/o/oauth2/token'*/
    },
    startRedirectPath: '/google/login',
    callbackUri: `${process.env.GLOBAL_URL}/auth/google/callback`
});

app.get('/google/callback', async(request, reply) => {
    if (!app.google) {
        request.log.error({
            error: {
                message: err.message,
                code: err.code
            },
            request: {
                method: request.method,
                url: request.url,
                ip: request.ip
            },
            event: 'google-Oauth_attempt'
        }, 'Google OAuth not initialized');
        return reply.redirect(`${FRONT}/oauth/callback?error=${encodeURIComponent('oauth_error')}`);
    }

    try {
        //recuperation du token d'acces et du token de rafraichisement
        const { token } = await app.google.getAccessTokenFromAuthorizationCodeFlow(request);
        
        //requete HTTP pour recuperer la data
        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token.access_token}`
            }
        });
        if (!response.ok)
            throw new Error(`HTTP error! status: ${response.status}`);
        
        //mettre en json pour ensuite mettre dans la db
        const {id: google_id, email, given_name, picture } = await response.json();

        const local = db.prepare('SELECT password FROM user WHERE email = ?').get(email);
        if (local && local.password){
            request.log.warn({
                event: 'google_oauth_attempt',
                user: { email }
            }, 'Google OAuth failed: email already registered locally');
           return reply.redirect(`${FRONT}/oauth/callback?error=${encodeURIComponent('sso_forbidden')}`);
        }
        let jwtToken;
        let refreshToken ;

        const user = db.prepare('SELECT * FROM user WHERE email = ?').get(email);
        if (user) {
            ({jwtToken, refreshToken} = await generateTokens(user.uuid, user.username, user.email));
            console.log({jwtToken: jwtToken})
            //jwtToken = await app.jwt.sign({ userId: user.uuid });
            const info = { online: 1, uuid: user.uuid }
           
            const response = await fetch('http://user:4000/online', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-internal-key': process.env.JWT_SECRET //cela permet a ce que seul un service ayant cette cle peut avoir accees a cette methode
            },
            body: JSON.stringify(info)
            });

            if (!response.ok)
                throw new Error(`HTTP error! status: ${response.status}`);

            request.log.info({
                event: 'google_oauth_attempt',
                user: { email }
             }, 'Google OAuth login sucess');


        } else {
            const uuid = crypto.randomUUID();
            db.prepare('INSERT INTO user (uuid, google_id, username, email, password, avatar) VALUES (?, ?, ?, ?, ?, ?)').run(uuid, google_id, given_name, email, null, picture);
            jwtToken, refreshToken = await generateTokens(uuid, given_name, email);
            
            //jwtToken = await app.jwt.sign({ userId: uuid });

            const info = { uuid: uuid, username: given_name, email: email, hash: null , avatar: picture}
            response = await fetch('http://user:4000/insert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-internal-key': process.env.JWT_SECRET
                },
                body: JSON.stringify(info)
            });
            if (!response.ok)
                throw new Error(`HTTP error! status: ${response.status}`);

            request.log.info({
                event: 'google_oauth_success',
                user: { email }
            }, 'Google OAuth new user sucess');
        }
        // reply.send({ message: 'logged in successfully', token: jwtToken, refreshToken });
        console.log(jwtToken);
        return reply.redirect(`${FRONT}/oauth/callback?token=${encodeURIComponent(jwtToken)}|refreshToken=${refreshToken}`);
    } catch (err) {
        request.log.error({
            event: 'google_oauth_attempt',
            error: {
                message: err.message,
                code: err.code
            },
        }, 'Google OAuth callback failed');
        return reply.redirect(`${FRONT}/oauth/callback?error=${encodeURIComponent('oauth_error')}`);
    }
});

app.register(fastifyOauth2, {
    name: 'githubOAuth2',
    scope: ['user', 'email'],
    credentials: {
        client: {
            id: process.env.GITHUB_CLIENT_ID,
            secret: process.env.GITHUB_CLIENT_SECRET
        },
        auth: fastifyOauth2.GITHUB_CONFIGURATION
    },
    startRedirectPath: '/github/login',
    callbackUri: `${process.env.GLOBAL_URL}/auth/github/callback`
})

// est un objet Map pour stocker les token en memoire
const memStore = new Map()

// pour enregister un token
async function saveAccessToken (token) {
    memStore.set(token.refresh_token, token)
}

//pour recuperer un token a partir de la memoire
async function retrieveAccessToken (token) {
    if (token.startsWith('Bearer ')) {
        token = token.substring(7)
    }
    if (memStore.has(token)) {
        return memStore.get(token)
    }
    throw new Error('invalid refresh token')
}

app.get('/github/callback', async function (request, reply) {

    try {
        const { token }= await app.githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(request)
        await saveAccessToken(token)
        
        const userResponse = await fetch('https://api.github.com/user', {
            headers: {
                    Authorization: `token ${token.access_token}`
                }
        });
        const emailResponse = await fetch('https://api.github.com/user/emails', {
            headers: {
                    Authorization: `token ${token.access_token}`
                }
        });

        // Parse GitHub user first to obtain login for fallback email if needed
        const { login, avatar_url, id } = await userResponse.json();
        
        const emails = await emailResponse.json();
        const emailPrimary = await emails.find(email => email.primary)?.email || null;
        //a voir si on garde
        // let emailPrimary = (Array.isArray(emails) && (
        // // emails.find(e => e.primary && e.verified)?.email ||
        // // emails.find(e => e.verified)?.email ||
        // // emails[0]?.email
        // // )) || null;
        //Fallback for users with hidden email on GitHub
        // // if (!emailPrimary && login) {
            // // emailPrimary = `${login}@users.noreply.github.com`;
        // // } 
        // if (!emailPrimary) {
            //Cannot proceed without an email; redirect back with an error
            // return reply.redirect(`${FRONT}/oauth/callback?error=${encodeURIComponent('no_email_from_github')}`);
        // }

        const local = db.prepare('SELECT password FROM user WHERE email = ?').get(emailPrimary);
        if (local && local.password){
            request.log.warn({
                event: 'github_oauth_attempt',
                user: { email: emailPrimary }
                }, 'GitHub OAuth failed: email already registered locally');
            return reply.redirect(`${FRONT}/oauth/callback?error=${encodeURIComponent('sso_forbidden')}`);
        }


        const user = db.prepare('SELECT * FROM user WHERE email = ?').get(emailPrimary);
        let jwtToken; 
        let refreshToken;

        if (user) {
            ({jwtToken, refreshToken  }= await generateTokens(user.uuid, user.username, user.email));
            //jwtToken = await app.jwt.sign({ uuid: user.uuid, username: user.username, email: user.email});
            
            const info = { online: 1, uuid: user.uuid }
            const response = await fetch('http://user:4000/online', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-internal-key': process.env.JWT_SECRET //cela permet a ce que seul un service ayant cette cle peut avoir accees a cette methode
                },
                body: JSON.stringify(info)
            });

            if (!response.ok)
                throw new Error(`HTTP error! status: ${response.status}`);

            request.log.info({
                event: 'github_oauth_attempt',
                user: { email: emailPrimary, username: login }
            }, 'GitHub OAuth login sucess');

        } else {
            const uuid = crypto.randomUUID();
            db.prepare('INSERT INTO user (uuid, discord_id, username, email, password, avatar) VALUES (?, ?, ?, ?, ?, ?)').run(uuid, id, login, emailPrimary, null, avatar_url)

            const info = { uuid: uuid, username: login, email: emailPrimary, hash: null, avatar: avatar_url }
            const response = await fetch('http://user:4000/insert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-internal-key': process.env.JWT_SECRET
                },
                body: JSON.stringify(info)
            });

            if (!response.ok)
                throw new Error(`HTTP error! status: ${response.status}`);

            ({jwtToken, refreshToken} = await generateTokens(uuid, login, emailPrimar));
            //jwtToken = await app.jwt.sign({ uuid: uuid, username: login, email: emailPrimary});
            request.log.info({
                event: 'github_oauth_attempt',
                user: { email: emailPrimary, username: login }
                }, 'GitHub OAuth new user sucess');

        }
        //reply.send({ access_token: token.access_token, jwtToken, refreshToken });
        return reply.redirect(`${FRONT}/oauth/callback?token=${encodeURIComponent(jwtToken)}|refreshToken=${refreshToken}`);
     } catch (err) {
        request.log.error({
            event: 'github_oauth_attempt',
            error: {
                message: err.message,
                code: err.code
            },
        }, 'Github OAuth callback failed');
        return reply.redirect(`${FRONT}/oauth/callback?error=${encodeURIComponent('oauth_error')}`);
    }
})

app.get('/github/refreshAccessToken', async function (request, reply) {
    try {
        const refreshToken = await retrieveAccessToken(request.headers.authorization);
        const newToken = await this.githubOAuth2.getAccessTokenFromRefreshToken(refreshToken, {});
        await saveAccessToken(newToken);
        reply.send({ access_token: newToken.access_token });
    } catch (err) {
        request.log.error({
            event: 'github_refresh_token_attempt',
            error: err.message
        }, 'GitHub refresh token failed');
        reply.code(500).send({ error: 'Token refresh failed' });
    }
});


app.get('/github/verifyAccessToken', function (request, reply) {
  const { accessToken } = request.query
  sget.concat({
      url: `https://api.github.com/applications/${process.env.GITHUB_CLIENT_ID}/token`,
      method: 'POST',
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(`${process.env.GITHUB_CLIENT_ID}:` + `${process.env.GITHUB_CLIENT_SECRET}`).toString('base64')
      },
      body: JSON.stringify({ access_token: accessToken }),
      json: true
    },
    function (err, _res, data) {
        if (err) {
            request.log.error({
                event: 'github_verify_token_attempt',
                error: err.message
            }, 'GitHub token verification failed');
            reply.send(err);
            return;
        }
        reply.send(data);
    });
});

app.delete('/account', async (request, reply) => {
    let uuid;
    try {
        uuid = await checkToken(request);
    } catch (err) {
        request.log.warn({
            event: 'delete_account_attempt',
            error: err.message
        }, 'Account deletion failed: unauthorized');
        reply.code(401).send({ error: 'Unauthorized'});
    }

    try {
        await fetch('http://game:4000/delete-game', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'x-internal-key': process.env.JWT_SECRET
            },
            body: JSON.stringify(uuid)
        })

        await fetch('http://tournament:4000/delete-tournament', {
            method: 'DELETE',
            headers: {
                'Content-type': 'application/json',
                'x-internal-key': process.env.JWT_SECRET
            },
            body: JSON.stringify(uuid)
        })

        await fetch('http://user:4000/delete-user', {
            method: 'DELETE',
            headers: {
                'Content-type': 'application/json',
                'x-internal-key': process.env.JWT_SECRET
            },
            body: JSON.stringify(uuid)
        })

        db.prepare('DELETE FROM user WHERE uuid = ?').run(uuid);
        request.log.info({
            event: 'delete-account_attempt'
        }, 'User account deleted successfully');
        reply.send('User delete with success');

    } catch (err) {
        request.log.error({
            event: 'delete-account_attempt',
            error: err.message
        }, 'Delete account failed');
        reply.code(500).send({ error: 'Delete account failed' });
    }
});

// Middleware pour vérifier le JWT et récupérer le uuid
async function checkToken(request) {
    const authHeader = request.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.code(401).send({ error: 'Unauthorized' });
    }

    const token = authHeader.slice(7); // slice coupe le nombre de caractere donne
    const payload = await request.jwtVerify(); // methode de fastify-jwt pour verifier le token
    return payload.uuid;
}

async function generateTokens(uuid, username, email) {
    const jwtToken = await app.jwt.sign({ uuid: uuid, username: username, email: email });
    const refreshToken = crypto.randomBytes(64).toString('hex');

    // Le refresh token expirera dans 7 jours
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Stocker le refresh token en mémoire (à remplacer par une base de données ou un stockage persistant en production)
    memStore.set(refreshToken, { 
        uuid, 
        username, 
        email, 
        refresh_token: refreshToken,
        expires
    });
    return { jwtToken, refreshToken };
}
app.setErrorHandler((error, request, reply) => {
    request.log.error({ error:error.message, code: error.code, route: request.routerPath }, 'Unhandled Error, Internal server error');
    reply.status(500).send({ error: 'Internal Server Error' });
});


app.get('/', async(request, reply) => {
    return 'hello';
});

app.get('/register', async(request, reply) => {
    return 'register';
});

app.get('/login', async(request, reply) => {
    return 'login';
});

app.listen({ port: 4000, host: '0.0.0.0' })
