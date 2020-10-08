const env = process.env.ENVIRONMENT || 'development';

module.exports = {
    db: env === 'production' ? process.env.DB_PRODUCTION : process.env.DB_DEVELOPMENT,
    site: "https://inspector-hogar.herokuapp.com" //"https://ih-socialventis.netlify.app"
}