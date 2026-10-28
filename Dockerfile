FROM node:24-bookworm-slim AS build
WORKDIR /app
RUN npm install --global bun@1.4.4
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
# These are public client configuration values, never service-role credentials.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
RUN test -n "$VITE_SUPABASE_URL" && test -n "$VITE_SUPABASE_PUBLISHABLE_KEY" && bun run build

FROM node:24-bookworm-slim AS runtime
ENV NODE_ENV=production HOST=0.0.0.0 PORT=8080
WORKDIR /app
COPY --from=build --chown=node:node /app/.output ./.output
USER node
EXPOSE 8080
CMD ["node", ".output/server/index.mjs"]
