export default {
    APP_NAME: "nodejs-boilertemplate",

    MONGODB_URI: process.env.MONGO_ATLAS_URI || "mongodb://127.0.0.1:27017/nodejs-boilertemplate",

    BCRYPT_SALT: process.env.BCRYPT_SALT || 10,

    JWT_SECRET: process.env.JWT_SECRET || "000-12345-000",
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1h",

    TOKEN_EXPIRY_DURATION: process.env.TOKEN_EXPIRY_DURATION || 900, // 15 minutes

    ROLES: {
        USER: ["user", "admin"],
        ADMIN: ["admin"],
    },

    URL: {
        LANDING_BASE_URL: process.env.LANDING_BASE_URL || "http://localhost:3000",
    },

    MAILER: {
        HOST: process.env.MAILER_HOST,
        USER: process.env.MAILER_USER,
        PASSWORD: process.env.MAILER_PASSWORD,
        PORT: process.env.MAILER_PORT,
        SECURE: process.env.MAILER_SECURE,
        DOMAIN: "@nodejs-boilertemplate.com",
    },
};
