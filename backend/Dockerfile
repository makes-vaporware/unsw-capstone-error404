# Select a base image
FROM node:18-alpine

# Create a directory  and go to the directory 
WORKDIR /app

# Copy the package.json file to my current directory to install the necessary dependence  
COPY package.json .

# Install the dependence
RUN npm install

# Copy other files to my current directory
COPY . .

# Open the port for the express server
EXPOSE 3500

# Run express run in the foreground
CMD ["npm", "start"]