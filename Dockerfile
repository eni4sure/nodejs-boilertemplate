# build stage
FROM node:18.15.0-alpine AS build-stage

RUN apk update && \
    apk upgrade && \
    apk add --no-cache git dumb-init

# Set production environment
ENV NODE_ENV=production

# Set the working directory to /usr/src/app
WORKDIR /usr/src/app

# Copy package.json files to the working directory (./)
COPY yarn.lock ./
COPY package.json ./

# Install dependencies using yarn
RUN yarn install --frozen-lockfile

# Copy the rest of the application code to the working directory
COPY ./ .

# Custom build workflows should be added below here
# ==========================================
# - Build TSC
RUN yarn build
# ==========================================



# runtime stage
FROM node:18.15.0-alpine as runtime-stage

RUN apk update && \
    apk upgrade && \
    apk add --no-cache git dumb-init

# Set production environment
ENV NODE_ENV=production

# Set the working directory to /usr/src/app
WORKDIR /usr/src/app

# pick up only the files we need from the build-stage
COPY --from=build-stage /usr/src/app/yarn.lock ./
COPY --from=build-stage /usr/src/app/package.json ./
COPY --from=build-stage /usr/src/app/public ./public

# Install dependencies using yarn
# By using --production and --no-cache flags with yarn install, we ensure that only production dependencies are installed, and that the cache is not saved, resulting in a smaller image size.
RUN yarn install --production --no-cache

# Copy the rest of the application code to the working directory
COPY --from=build-stage /usr/src/app/dist ./dist

# Set port environment variable
ENV PORT=80

# Expose port 80
EXPOSE 80

# Start the application
CMD ["dumb-init", "node", "dist/index.js"]
