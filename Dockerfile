#-----------------------------------------------------------------------------------------------------------------------
# Rancher Redeploy Dockerfile
#-----------------------------------------------------------------------------------------------------------------------

FROM node:14-alpine

RUN mkdir -p /app
WORKDIR /app

# Copy required file
COPY deploy.js /app
COPY package.json /app
COPY package-lock.json /app

# Install node modules
RUN npm install --production --ignore-scripts

# Do the deploy
CMD [ "node", "deploy.js" ]

#-----------------------------------------------------------------------------------------------------------------------
