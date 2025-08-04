// src/config/index.js
import 'dotenv/config';

export const port = process.env.PORT || 3000;
export const jwtSecret = process.env.JWT_SECRET || 'devsecret';