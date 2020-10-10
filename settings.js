const env = process.env.ENVIRONMENT || 'development';

module.exports = {
    db: env === 'production' ? process.env.DB_PRODUCTION : process.env.DB_DEVELOPMENT,
    site: "https://api-ih.socialventisdev.cl",
    public_site: "https://ih-front.socialventisdev.cl/"
}