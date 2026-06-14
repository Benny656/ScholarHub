FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY --from=builder /usr/src/app/dist ./dist

# Create empty .env file inside container as env vars will be passed dynamically via docker-compose
RUN touch .env

EXPOSE 5000

CMD ["npm", "start"]
