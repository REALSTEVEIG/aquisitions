# ---- Stage 1: Install dependencies ----
FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

# ---- Stage 2: Development ----
FROM deps AS development

WORKDIR /app

COPY . .

RUN mkdir -p logs

EXPOSE ${PORT:-3000}

CMD ["node", "--watch", "src/index.js"]

# ---- Stage 3: Production ----
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

COPY . .

RUN mkdir -p logs

EXPOSE ${PORT:-3000}

USER node

CMD ["node", "src/index.js"]
