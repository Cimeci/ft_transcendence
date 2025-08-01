# FROM node:24.4.1-alpine
# WORKDIR /app
# RUN apk add --no-cache python3 make g++ sqlite-dev
# COPY package.json .
# COPY package-lock.json .
# RUN npm ci --only=production
# COPY . .
# EXPOSE 3001
# # RUN chown -R node src/auth/auth.js
# # USER node
# CMD ["node", "server.js"]

FROM node:20-slim
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["node", "src/auth/auth.js"]