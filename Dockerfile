# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency catalogs
COPY package*.json ./

# Install all dependencies including devDependencies to run build
RUN npm ci

# Copy application source code
COPY . .

# Run production build scripts (vite build & esbuild compilation)
RUN npm run build

# Stage 2: Production release environment
FROM node:20-alpine AS runner

WORKDIR /app

# Mark production environment and set default Hugging Face application port
ENV NODE_ENV=production
ENV PORT=7860

# Copy dependency catalogs for production install
COPY package*.json ./

# Install ONLY production dependencies to keep the container lightweight
RUN npm ci --only=production

# Copy precompiled backend and frontend bundle files from builder state
COPY --from=builder /app/dist ./dist

# Expose native 7860 web server port required by Hugging Face Spaces
EXPOSE 7860

# Launch server
CMD ["node", "dist/server.cjs"]
