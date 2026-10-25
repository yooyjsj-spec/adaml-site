FROM node:20-alpine AS build
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat python3 make g++
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci
COPY tsconfig.server.json prisma.config.ts ./
COPY server ./server
COPY src ./src
RUN npx prisma generate
RUN npm run build:api

FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat python3 make g++
COPY package.json package-lock.json* ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci
ENV NODE_ENV=production
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/server/dist ./server/dist
COPY server ./server
COPY src ./src
EXPOSE 4000
CMD ["node", "server/dist/index.js"]
