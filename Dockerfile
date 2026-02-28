# ── Stage 1: Install dependencies ──
FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ── Stage 2: Build ──
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# Flatten standalone output (Next.js 16 nests under package name)
# Move everything including hidden dirs like .next
RUN STANDALONE_DIR=".next/standalone"; \
    if [ -f "$STANDALONE_DIR/server.js" ]; then \
      echo "Standalone at root"; \
    elif [ -d "$STANDALONE_DIR/sumsori" ]; then \
      echo "Standalone nested under sumsori — flattening"; \
      cp -a "$STANDALONE_DIR/sumsori/." "$STANDALONE_DIR/"; \
      rm -rf "$STANDALONE_DIR/sumsori"; \
    else \
      echo "ERROR: Cannot find server.js" && exit 1; \
    fi && \
    echo "Standalone contents:" && ls -la "$STANDALONE_DIR/"

# ── Stage 3: Production runner ──
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy entire standalone output (includes .next, node_modules, server.js)
COPY --from=builder /app/.next/standalone/ ./

# Overlay static files (not included in standalone)
COPY --from=builder /app/.next/static ./.next/static

# Public assets
COPY --from=builder /app/public ./public

USER nextjs

EXPOSE 8080

CMD ["node", "server.js"]
