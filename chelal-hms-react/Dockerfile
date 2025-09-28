# Use Node.js 18 as base image
FROM node:18-alpine

# Accept build arguments
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (use npm install inside Docker to generate a lockfile if missing
# and allow resolving peer dependency issues during image build)
RUN npm install --legacy-peer-deps --no-audit --no-fund

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start the development server
CMD ["npm", "run", "dev"]
