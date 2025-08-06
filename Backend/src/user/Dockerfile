FROM node:20-slim
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
EXPOSE 4000
# CMD ["node", "user.js"]
CMD ["npm", "run", "dev"]
