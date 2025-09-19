# =========================
# Dockerfile for Dev Only
# =========================
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Enable Corepack for Yarn 4
RUN corepack enable
RUN corepack prepare yarn@stable --activate

# Copy project files
COPY . .

# Install dependencies
RUN yarn install --immutable

# Expose dev server port
EXPOSE 8081

# Start React dev server
CMD ["yarn", "start", "--host", "0.0.0.0", "--port", "8081"]
