FROM node:20-slim
WORKDIR /app
COPY package*.json .
# COPY package-lock.json .
# RUN npm ci --only=production
RUN npm install
COPY . .
EXPOSE 4000
CMD ["node", "user.js"]