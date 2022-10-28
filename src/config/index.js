const config = {
    APP_NAME: "node-express-starter",
    JWT_SECRET: process.env.JWT_SECRET || "000-12345-000",
    MONGODB_URI: process.env.MONGO_ATLAS_URI || "mongodb://localhost:27017/node-express-starter",
    BCRYPT_SALT: process.env.BCRYPT_SALT || 10,
    role: {
        USER: ["user", "admin"],
        ADMIN: ["admin"]
    },
    URL: {
        LANDING_URL: process.env.LANDING_URL || "http://localhost:3000",
        DASHBOARD_URL: process.env.DASHBOARD_URL || "http://localhost:3001"
    },
    mailer: {
        HOST: process.env.MAILER_HOST || "smtp.gmail.com",
        USER: process.env.MAILER_USER || "username@gmail.com",
        PASSWORD: process.env.MAILER_PASSWORD || "password",
        PORT: process.env.MAILER_PORT || 465,
        SECURE: process.env.MAILER_SECURE || true,
        DOMAIN: "@node-express-starter.com"
    }
};

module.exports = config;
