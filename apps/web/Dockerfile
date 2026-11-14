FROM node:22-slim
WORKDIR /app
COPY package.json ./
RUN npm install --no-audit --no-fund
COPY index.html tsconfig.json vite.config.ts ./
COPY src/ src/
ENV VITE_GATEWAY_URL=http://localhost:8080
EXPOSE 5173
CMD ["npm", "run", "dev"]
