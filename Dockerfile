FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY frontend/package*.json frontend/
RUN npm --prefix frontend ci

COPY backend/package*.json backend/
RUN npm --prefix backend ci

COPY . .

RUN npm run compile:spec \
  && npm run generate:api-types \
  && npm run build:web \
  && npm --prefix backend run build

FROM node:22-alpine AS runtime

WORKDIR /app/backend

ENV HOST=0.0.0.0
ENV NODE_ENV=production
ENV PORT=3000

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/backend/dist ./dist
COPY --from=build /app/frontend/.output/public ./public

EXPOSE 3000

CMD ["node", "dist/main.js"]
