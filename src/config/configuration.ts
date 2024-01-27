export default () => ({
  port: process.env.PORT,
  database: {
    mongoUri: process.env.MONGO_URI,
  },
  secrets: {
    jwtSecret: process.env.JWT_SECRET,
  },
  redis: {
    url: process.env.REDIS_URL,
  },
})
