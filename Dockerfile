FROM node:16
WORKDIR /app
COPY . .
RUN yarn install
EXPOSE 9090
ENV NODE_ENV=production
ENV PORT=9090
CMD ["yarn", "dev"]

