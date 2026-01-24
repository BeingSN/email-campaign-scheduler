FROM node:10

# Create app directory
RUN mkdir -p /home/nodejs/app
WORKDIR /home/nodejs/app

# Install app dependencies
RUN npm i npm@latest -g
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install

EXPOSE 3000

# Bundle app source
COPY . .

# It starts the scheduler, runs all the required processes in sequential order
CMD ["npm", "start"]
