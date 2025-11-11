# ft_transcendence - Frontend

Frontend for the ft_transcendence project: a Single Page Application (SPA) for real-time Pong gaming with tournament features and a complete social system.

## 📋 Table of Contents

- [About](#about)
- [Technologies](#technologies)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Features](#features)
- [Architecture](#architecture)
- [Available Scripts](#available-scripts)
- [Internationalization](#internationalization)
- [WebSockets](#websockets)
- [Styling](#styling)
- [Security](#security)

## 🎯 About

Frontend for the ft_transcendence project at 42 school. This is a Single Page Application (SPA) built with **vanilla TypeScript** (no framework) that allows you to:
- Play Pong in real-time (local and online)
- Participate in tournaments with bracket system
- Manage your profile and statistics
- Communicate via a friend system with invitations
- Customize your experience with a cosmetics shop

## 🚀 Technologies

### Core Stack
- **TypeScript** - Main language
- **Tailwind CSS** - Utility-first CSS framework
- **WebSockets** - Real-time communication

### Development Tools
- **Nginx** - Production web server
- **Docker** - Containerization

### APIs & Services
- **Fetch API** - HTTP requests
- **WebSocket API** - Bidirectional communication
- **OAuth 2.0** - GitHub/Google authentication
- **2FA** - Two-factor authentication

## 📁 Project Structure

```
frontend/
├── public/               # Static assets
│   ├── avatar/          # Default avatars
│   ├── ball/            # Game balls
│   ├── bg/              # Backgrounds
│   ├── icons/           # SVG icons
│   └── playbar/         # Paddles
├── src/
│   ├── components/      # Reusable components
│   │   ├── bracket.ts         # Tournament system (SVG bracket)
│   │   ├── navbar.ts          # Navigation bar
│   │   ├── notifications_overlay.ts  # Notification system
│   │   └── utils.ts           # Utilities (sliders, buttons, etc.)
│   ├── pages/           # Application pages
│   │   ├── credits.ts         # Credits page
│   │   ├── friends.ts         # Friends management
│   │   ├── home.ts            # Home page
│   │   ├── inventory.ts       # User inventory
│   │   ├── landing.ts         # Landing page
│   │   ├── login.ts           # Authentication
│   │   ├── pong.ts            # Main Pong menu
│   │   ├── pongLocal.ts       # Local Pong
│   │   ├── pongOnline.ts      # Online Pong
│   │   ├── register.ts        # Registration
│   │   ├── settings.ts        # User settings
│   │   ├── shop.ts            # Cosmetics shop
│   │   ├── tournament.ts      # Tournament system
│   │   └── user.ts            # User profile
│   ├── global.d.ts      # Global TypeScript declarations
│   ├── i18n.ts          # Internationalization (FR/EN/ES)
│   ├── linkUser.ts      # User state management
│   ├── routes.ts        # Routing system (SPA)
│   └── style.css        # Global styles + Tailwind
├── Dockerfile           # Docker configuration
├── nginx.conf           # Nginx configuration
├── index.html           # HTML entry point
├── package.json         # npm dependencies
├── tsconfig.json        # TypeScript configuration
└── README.md            # This file
```

## ✨ Features

### 🔐 Authentication
- Classic login (email/password)
- OAuth GitHub and Google
- Two-factor authentication (2FA) via email
- JWT session management
- Protected routes

### 🎮 Pong Game

#### Local Mode
- Two-player game on same device
- Controls: `W`/`S` (player 1) and `↑`/`↓` (player 2)
- Player name selection
- Cosmetics customization

#### Online Mode
- Real-time matchmaking via WebSockets
- Server-side game state synchronization
- Friend invitation system
- Latency management

#### Tournaments
- Tournament creation (2 to 16 players)
- Public or private tournaments (with password)
- Dynamic SVG bracket generation
- Progressive round system
- Friend invitations to tournament
- Real-time progress tracking

### 👥 Social System

#### Friends
- User search (by name or UUID)
- Send/receive friend requests
- Friends list with online status
- Game and tournament invitations

#### Notifications
- Real-time notification system
- Toast notifications for invitations
- Invitations in tournament and OnlineGame
- Notification management overlay
- Notification persistence

### 🎨 Customization

#### Inventory
- Custom avatars
- Custom paddles
- Custom balls
- Custom Game backgrounds

#### Shop
- Buy cosmetics with virtual currency
- Category filtering
- Item search
- Preview system

### 👤 Profile
- Game statistics (wins, losses, ratio)
- Match history (classic and tournament)
- Display of equipped cosmetics
- Public profile page

### ⚙️ Settings
- Change email
- Change password
- Change username
- Change tournament name
- Custom avatar upload
- Enable/disable 2FA
- Language selection

## 🏗️ Architecture

### Single Page Application (SPA)

The application uses a **custom routing system** without any framework:

```typescript
// routes.ts
const routes = {
    '/': LandingPage,
    '/login': LoginPage,
    '/home': HomePage,
    // ... other routes
};

export const navigateTo = async (url: string) => {
    history.pushState(null, '', url);
    await renderPage();
};
```

### State Management

#### Global User State
```typescript
// linkUser.ts
let cachedUser: User | null = null;
const listeners = new Set<(u: User | null) => void>();

export function onUserChange(cb: (u: User | null) => void) {
    listeners.add(cb);
    return () => listeners.delete(cb);
}
```

#### Cache and Synchronization
- In-memory cache for user and inventory
- Listener system for reactive updates
- Automatic refresh after modifications

### Backend Communication

#### REST API
```typescript
// Example: Fetch user
const response = await fetch('/user/me', {
    headers: { Authorization: `Bearer ${token}` }
});
```

#### WebSockets (Online Pong)
```typescript
const socket = new WebSocket(`wss://${window.location.host}/websocket/${gameId}`);

// Events sent to server
socket.send(JSON.stringify({
    event: 'move',
    paddle: 'left',
    direction: 'up'
}));

// Events received from server
socket.onmessage = (ev) => {
    const state = JSON.parse(ev.data);
    // { ball, leftPaddle, rightPaddle, score }
};
```

### Game Rendering (Canvas)

```typescript
// Main render loop
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw paddles
    ctx.drawImage(leftBarImg, leftPaddle.x, leftPaddle.y, paddleWidth, paddleHeight);
    
    // Draw ball with rotation
    ctx.save();
    ctx.translate(ball.x, ball.y);
    ctx.rotate(ballRotation);
    ctx.drawImage(ballImg, -ball.radius, -ball.radius, ball.radius * 2, ball.radius * 2);
    ctx.restore();
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}
```

## 🌍 Internationalization

The application supports **3 languages**:
- 🇫🇷 French
- 🇬🇧 English
- 🇪🇸 Spanish

### Usage

```typescript
// i18n.ts
export const translations = {
    fr: { login: "Connexion", ... },
    en: { login: "Login", ... },
    es: { login: "Iniciar sesión", ... }
};

// In a page
import { t } from './pages/settings';
button.textContent = t.login; // Uses active language
```

### Language Change
- Language selector in settings
- Persistence in `localStorage`
- Automatic reload after change

## 🔌 WebSockets

### Online Pong

#### Connection
```typescript
const socket = new WebSocket(`wss://localhost:4443/websocket/${gameUuid}`);

socket.onopen = () => {
    socket.send(JSON.stringify({
        event: 'join',
        username: user.username,
        uuid: user.uuid
    }));
};
```

#### Client → Server Messages

**Paddle Movement**
```json
{
    "event": "move",
    "paddle": "left",
    "direction": "up"
}
```

**Stop Movement**
```json
{
    "event": "stop",
    "paddle": "left"
}
```

#### Server → Client Messages

**Position Assignment**
```json
{
    "event": "assigned",
    "position": "left"
}
```

**Game State Update**
```json
{
    "ball": { "x": 350, "y": 400, "radius": 20 },
    "leftPaddle": { "y": 300 },
    "rightPaddle": { "y": 300 },
    "score": { "left": 1, "right": 0 }
}
```

**Game Over**
```json
{
    "event": "game_over",
    "winner": "left"
}
```

### Connection Management
- Automatic reconnection on disconnect
- Timeout handling
- Listener cleanup on destruction

## 🎨 Styling

### Tailwind CSS
The application uses Tailwind CSS with **custom utility classes**:

```css
/* Matrix neon effects */
.neon-matrix {
    text-shadow: 0 0 4px #39ff14, 0 0 8px #39ff14;
    font-family: 'Orbitron', 'monospace';
}

/* Glass morphism */
.glass-blur {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(12px) saturate(120%);
    border: 1px solid rgba(255, 255, 255, 0.18);
}
```

### Animations
- **Shake**: Error animations
- **Fade**: Page transitions
- **Animated gradient**: Button borders
- **Neon pulse**: Glow effects

## 🔒 Security

- **JWT**: Tokens stored in `localStorage`, server-side validation
- **Protected routes**: JWT verification before accessing private pages
- **2FA**: Email verification code
- **OAuth**: Authentication delegation to GitHub/Google
- **HTTPS**: Encrypted communication (required)
- **Validation**: Client-side AND server-side validation

## 🐛 Debugging

### Console Logs
Logs are present in several files for debugging:
- `routes.ts`: Navigation and routing
- `linkUser.ts`: User state
- `pongOnline.ts`: WebSockets and synchronization
- `tournament.ts`: Tournament management

### Development Tools
- **Vite**: Hot Module Replacement (HMR)
- **TypeScript**: Type checking
- **DevTools**: WebSocket and Network inspection

## 🚀 Docker Configuration

### Multi-stage Build

```dockerfile
# Stage 1: Builder
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build

# Stage 2: Production
FROM nginx:stable-alpine3.21
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration

```nginx
server {
    listen       80;
    server_name  frontend;
    root         /usr/share/nginx/html;
    index        index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 📊 Project Statistics

- **Language**: TypeScript (100%)
- **Total Files**: ~50
- **Lines of Code**: ~15,000+
- **Components**: 4 reusable components
- **Pages**: 13 different pages
- **Routes**: 17 routes (public and private)
- **Supported Languages**: 3 (FR, EN, ES)

## 📝 Code Conventions

### Naming
- **Files**: camelCase (`pongLocal.ts`)
- **Functions**: camelCase (`navigateTo()`)
- **Classes/Interfaces**: PascalCase (`Tournament`, `User`)
- **Constants**: UPPER_SNAKE_CASE (`MATCH_HEIGHT`)

### File Organization
```typescript
// 1. Imports
import { t } from './settings';
import { navigateTo } from '../routes';

// 2. Types/Interfaces
interface Tournament {
    uuid: string;
    name: string;
}

// 3. Functions
export function TournamentPage(): HTMLElement {
    // Implementation
}
```

### Git Commit Format
```
type(scope): message

Types: feat, fix, refactor, style, docs, test, chore
Examples:
- [feat](tournament): add bracket visualization
- [fix](auth): correct 2FA validation
- [refactor](pong): optimize game loop
```

### Guidelines
- Follow code conventions
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation if necessary

## 📄 License

This project is part of the 42 school curriculum.

## 👥 Contributor

- **Ilan (Inowak--)** - Frontend

---
