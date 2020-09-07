const env = process.env.ENVIRONMENT || 'development';

module.exports = {
    db: env === 'production' ? process.env.DB_PRODUCTION : process.env.DB_DEVELOPMENT,
    site: "http://167.99.168.155"
}