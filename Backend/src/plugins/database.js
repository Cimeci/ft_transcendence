import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
import fp from 'fastify-plugin';

// creer la db pour les tables que l'on va creer
async function databasePlugin(fastify, options) {
  try {
    mkdirSync('./db', { recursive: true });
    
    const db = new Database('./db/pong.sqlite');
    
    const query = `
      CREATE TABLE IF NOT EXISTS test (
        id INTEGER PRIMARY KEY,
        message TEXT
      );
    `;
    
    db.exec(query);
    
    fastify.decorate('db', db);
    
    fastify.addHook('onClose', async (instance) => {
      instance.db.close();
    });
    
  } catch (error) {
    console.error('Database plugin error:', error);
    throw error;
  }
}

// Export avec fastify-plugin pour éviter l'encapsulation
export default fp(databasePlugin);