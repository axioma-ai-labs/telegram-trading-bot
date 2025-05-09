FROM node:18-alpine AS builder

# Create app directory
WORKDIR /neurodex-bot

# Install pnpm
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml
COPY package*.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Production stage
FROM node:18-alpine AS production

# Set node environment to production
ENV NODE_ENV=production

# Create app directory
WORKDIR /neurodex-bot

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package*.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built files from builder stage
COPY --from=builder /neurodex-bot/dist ./dist

# Command to run the app
CMD ["node", "dist/bot.js"] 