
# Use official Node.js (LTS) as the base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json .

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Generate Prisma client (inside the container, for Linux)
RUN npx prisma generate


# Expose the port the app runs on
EXPOSE 3000

# Command to run the app
CMD ["npm", "start"]

