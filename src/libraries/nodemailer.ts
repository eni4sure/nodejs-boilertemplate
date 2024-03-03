import nodemailer from "nodemailer";
import * as Sentry from "@sentry/node";
import * as aws from "@aws-sdk/client-ses";

import { CONFIGS } from "@/configs";
import { sesClient } from "@/libraries/aws";

class Mailer {
    private static instance: Mailer;
    private transporter: nodemailer.Transporter;

    private constructor() {
        if (CONFIGS.MAILER.USE_AWS_SES === true) {
            if (!CONFIGS.AWS.ACCESS_KEY_ID) throw new Error("AWS_ACCESS_KEY_ID config not found");
            if (!CONFIGS.AWS.SECRET_ACCESS_KEY) throw new Error("AWS_SECRET_ACCESS_KEY config not found");

            this.transporter = nodemailer.createTransport({
                sendingRate: 50,
                SES: { aws: aws, ses: sesClient },
            });
        } else {
            if (!CONFIGS.MAILER.SMTP_HOST) throw new Error("SMTP_HOST config not found");
            if (!CONFIGS.MAILER.SMTP_PORT) throw new Error("SMTP_PORT config not found");
            if (!CONFIGS.MAILER.SMTP_USER) throw new Error("SMTP_USER config not found");
            if (!CONFIGS.MAILER.SMTP_PASSWORD) throw new Error("SMTP_PASSWORD config not found");

            this.transporter = nodemailer.createTransport({
                host: CONFIGS.MAILER.SMTP_HOST,
                port: Number(CONFIGS.MAILER.SMTP_PORT),
                secure: Boolean(CONFIGS.MAILER.SECURE),
                auth: {
                    user: CONFIGS.MAILER.SMTP_USER,
                    pass: CONFIGS.MAILER.SMTP_PASSWORD,
                },
            });
        }
    }

    static getInstance() {
        if (!Mailer.instance) {
            Mailer.instance = new Mailer();
        }

        return Mailer.instance;
    }

    async verifyConnection() {
        if (CONFIGS.MAILER.USE_AWS_SES === true) {
            return this.transporter.verify().then(() => {
                console.log(":::> Connected to mail server - using AWS SES");
            });
        }

        return this.transporter.verify().then(() => {
            console.log(`:::> Connected to mail server - ${CONFIGS.MAILER.SMTP_HOST}:${CONFIGS.MAILER.SMTP_PORT}`);
        });
    }

    async sendMail(mailOptions: nodemailer.SendMailOptions) {
        // Set default
        mailOptions = {
            ...mailOptions,
            from: mailOptions.from || CONFIGS.DEFAULT_EMAIL_FROM,
        };

        return this.transporter
            .sendMail(mailOptions)
            .then((info) => {
                // preview only available when sending through an Ethereal account
                if (CONFIGS.MAILER.SMTP_HOST === "smtp.ethereal.email") {
                    console.log(`:::> Mail sent: ${info.messageId}`);
                    console.log(`:::> Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
                }

                return info;
            })
            .catch((error) => {
                Sentry.captureException(new Error("From System: fn (sendMail)"), { extra: { mailOptions, error }, level: "error" });
            });
    }
}

// export a singleton instance of the mailer (to avoid creating multiple connections)
const nodemailerInstance = Mailer.getInstance();

export default nodemailerInstance;
