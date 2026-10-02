FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Cache bust: 2026-03-24-v2
EXPOSE 3001

CMD ["npm", "run", "start:prod"]
