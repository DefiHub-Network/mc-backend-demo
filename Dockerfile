# Stage 1: Build the application
FROM node:16-alpine as builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# Stage 2: Setup the runtime environment
FROM node:16-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy the built application from the previous stage
COPY --from=builder /app/dist ./dist

# Your app binds to port 3001
EXPOSE 3001

# Define the command to run your app
CMD ["node", "dist/index.js"]
