FROM node:alpine AS runner
WORKDIR /app

# Copy project files to the container image.
COPY . .

# Install the dependencies.
RUN npm install --only=production

# Start the application.
CMD ["npm", "start"]
