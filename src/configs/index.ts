import path from "path";
import dotenv from "dotenv";

dotenv.config({
    path: path.resolve(__dirname, "..", "..", ".env"),
});

const CONFIGS = {
    APP_NAME: "nodejs-boilertemplate",

    DEFAULT_EMAIL_FROM: "nodejs-boilertemplate <no-reply@nodejs-boilertemplate.com>",

    MONGODB_URI: process.env.MONGO_ATLAS_URI || "mongodb://127.0.0.1:27017/nodejs-boilertemplate",

    BCRYPT_SALT: Number(process.env.BCRYPT_SALT) || 10,

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
        SMTP_HOST: process.env.MAILER_SMTP_HOST,
        SMTP_PORT: process.env.MAILER_SMTP_PORT,
        SMTP_USER: process.env.MAILER_SMTP_USER,
        SMTP_PASSWORD: process.env.MAILER_SMTP_PASSWORD,
        SECURE: process.env.MAILER_SECURE === "true" ? true : false,
    },

    SENTRY: {
        DSN: process.env.SENTRY_DSN,
    },
};

// Uncomment below to check configs set
// console.log("CONFIGS:", CONFIGS);

export { CONFIGS };
