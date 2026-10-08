# Production Dockerfile for VigilEye AI Full-Stack Platform
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and package manifests
COPY package.json package-lock.json ./
COPY server/package.json ./server/
COPY client/package.json ./client/

# Install dependencies
RUN npm install
RUN npm install --prefix server
RUN npm install --prefix client

# Copy all source files
COPY . .

# Generate Prisma Client & Build Client Bundle
RUN cd server && npx prisma generate
RUN npm run build --prefix client

# Production Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

COPY --from=builder /app /app

EXPOSE 5000

CMD ["node", "server/src/server.js"]
