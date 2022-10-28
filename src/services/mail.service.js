const path = require("path");
const nodemailer = require("nodemailer");
const { mailer, APP_NAME } = require("../config");
const hbs = require("nodemailer-express-handlebars");
const CustomError = require("./../utils/custom-error");

class MailService {
    constructor(user) {
        this.user = user;
    }

    async send(subject, template, recipient, data = {}, layout, from) {
        const sender = from || `${APP_NAME.charAt(0).toUpperCase() + APP_NAME.slice(1)} <no-reply${mailer.DOMAIN}>`;

        if (!subject) throw new CustomError("subject is required");
        if (!template) throw new CustomError("template not found");
        if (!recipient || recipient.length < 1) throw new CustomError("Recipient is required");

        // Define nodemailer transporter
        const transporter = nodemailer.createTransport({
            host: mailer.HOST,
            port: mailer.PORT,
            secure: mailer.SECURE,
            auth: {
                user: mailer.USER,
                pass: mailer.PASSWORD
            }
        });

        // Merge Email Template
        transporter.use(
            "compile",
            hbs({
                viewEngine: {
                    extname: ".hbs",
                    layoutsDir: path.join(__dirname, "..", "templates", "email", "layouts"),
                    partialsDir: path.join(__dirname, "..", "templates", "email", "partials"),
                    defaultLayout: layout ? layout : "default"
                },
                viewPath: path.join(__dirname, "..", "templates", "email"),
                extName: ".hbs"
            })
        );

        const mail = {
            from: sender,
            to: Array.isArray(recipient) ? recipient.join() : recipient,
            subject,
            template,
            context: data
        };

        const result = await transporter.sendMail(mail);

        if (!result) throw new CustomError("Unable to send mail");

        return result;
    }

    async sendNewAccountEmail(link) {
        const subject = "Welcome to node-express-starter";
        const recipient = this.user.email;
        const template = "new-account-email";
        const emailData = {
            previewText: "Please confirm your email address in order to activate your account",
            user: {
                firstName: this.user.firstName,
                lastName: this.user.lastName
            },
            emailVerificationLink: link
        };

        return await this.send(subject, template, recipient, emailData, "default");
    }

    async sendVerificationLinkEmail(link) {
        const subject = "Verify Your Email";
        const recipient = this.user.email;
        const template = "verification-link-email";
        const emailData = {
            previewText: "Please confirm your email address in order to activate your account",
            user: {
                firstName: this.user.firstName
            },
            emailVerificationLink: link
        };

        return await this.send(subject, template, recipient, emailData, "default");
    }

    async sendPasswordResetEmail(link) {
        const subject = "Reset Password";
        const recipient = this.user.email;
        const template = "password-reset-email";
        const emailData = {
            previewText: "We received a request to reset your node-express-starter password",
            user: {
                firstName: this.user.firstName
            },
            passwordResetVerificationLink: link
        };

        return await this.send(subject, template, recipient, emailData, "default");
    }
}

module.exports = MailService;
