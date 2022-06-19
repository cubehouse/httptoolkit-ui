FROM node:14-alpine AS base
# location of our app in our Docker image
WORKDIR /usr/src/app
# first copy just our package json files
COPY package*.json ./



### = Build Image = ###
# build the image in a separate container
#  this container will contain all the dev dependencies needed to compile the UI
#  the actual container can then be slimmed down to just runtime dependencies
FROM base AS build
# install build tools
RUN apk add build-base python3
RUN npm install -g node-gyp
# run install in non-prouction so we can build the web UI
RUN npm install
# copy all files required to build app
COPY . .
# build our dist/ folder
RUN npm run build



### = Dependencies Image = ###
FROM base AS proddeps
# setup environment for production (no dev deps)
ENV NODE_ENV production

# run npm install again, but this time in production (no dev deps)
RUN npm install --only=production --production



### = Run Image = ###
# image that takes the built project, and the production dependencies, and runs the app
FROM base AS release

ENV NODE_ENV production

# install our server to serve the dist/ folder
RUN npm install -g static-server

# copy runtime dependencies from proddeps image to this image
COPY --from=proddeps /usr/src/app/node_modules ./node_modules
# copy built data from build image to this image
COPY --from=build /usr/src/app/dist ./dist

# web UI
EXPOSE 8080

# start UI server
CMD ["sh", "-c", "/usr/local/bin/static-server -p 8080 /usr/src/app/dist"]
