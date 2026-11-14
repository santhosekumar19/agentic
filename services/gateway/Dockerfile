FROM node:22-slim
WORKDIR /app
COPY package.json tsconfig.json ./
COPY src/ src/
ENV PORT=8080
USER node
EXPOSE 8080
CMD ["node", "--experimental-strip-types", "src/server.ts"]
