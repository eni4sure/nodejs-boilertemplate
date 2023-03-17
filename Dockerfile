# Use the latest stable node alpine image
FROM node:18.15.0-alpine

RUN apk update && \
    apk upgrade && \
    apk add --no-cache git dumb-init

# Set production environment
ENV NODE_ENV=production

# Set the working directory to /usr/src/app
WORKDIR /usr/src/app

# Copy package.json files to the working directory (./)
COPY ./package.json ./

# Install dependencies using yarn
# By using --production and --no-cache flags with yarn install, we ensure that only production dependencies are installed, and that the cache is not saved, resulting in a smaller image size.
RUN yarn install --production --no-cache

# Custom build workflows can be added here
# ============================================================

# ============================================================

# Copy the rest of the application code to the working directory
COPY ./ .

# Set port environment variable
ENV PORT=80

# Expose port 80
EXPOSE 80

# Start the application
CMD ["dumb-init", "node", "src/index.js"]