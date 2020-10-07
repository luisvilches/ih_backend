const env = process.env.ENVIRONMENT || 'development';

module.exports = {
    db: env === 'production' ? process.env.DB_PRODUCTION : process.env.DB_DEVELOPMENT,
    site: "https://ih-socialventis.netlify.app"
}