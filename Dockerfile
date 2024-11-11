# Use an official Ubuntu image as a base
FROM ubuntu:20.04

# Set environment variables to prevent interactive prompts during package installations
ENV DEBIAN_FRONTEND=noninteractive

# Install necessary dependencies (curl, gnupg, etc.)
RUN apt-get update && apt-get install -y \
  curl \
  gnupg \
  lsb-release \
  ca-certificates \
  build-essential \
  && rm -rf /var/lib/apt/lists/*

# Add Node.js 23.x repository and install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_23.x | bash - \
  && apt-get install -y nodejs

# Verify Node.js version
RUN node -v

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json into the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Expose port for your app (e.g., 3000 for Express apps)
EXPOSE 3000

# Command to run your app
CMD ["npm", "start"]
