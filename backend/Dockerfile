# Imagem da API do Startpoint
# A pasta frontend vai junto porque o Express também entrega as telas
FROM node:22-alpine

WORKDIR /app/backend

COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

COPY backend/src ./src
COPY frontend /app/frontend

EXPOSE 3000
CMD ["npm", "start"]
