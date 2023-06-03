import nodemailer from "nodemailer";

import { CONFIGS } from "@/configs";
import CustomError from "@/utilities/custom-error";

class Mailer {
    private static instance: Mailer;
    private transporter: nodemailer.Transporter;

    private constructor() {
        if (!CONFIGS.MAILER.SMTP_HOST) throw new CustomError("SMTP_HOST config not found");
        if (!CONFIGS.MAILER.SMTP_PORT) throw new CustomError("SMTP_PORT config not found");
        if (!CONFIGS.MAILER.SMTP_USER) throw new CustomError("SMTP_USER config not found");
        if (!CONFIGS.MAILER.SMTP_PASSWORD) throw new CustomError("SMTP_PASSWORD config not found");

        // To change the transport, e.g Amazon SES, etc...
        // check https://nodemailer.com/transports/
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

    static getInstance() {
        if (!Mailer.instance) {
            Mailer.instance = new Mailer();
        }

        return Mailer.instance;
    }

    async verifyConnection() {
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

        return this.transporter.sendMail(mailOptions).then((info) => {
            console.log(`:::> Mail sent: ${info.messageId}`);

            // Preview only available when sending through an Ethereal account
            if (CONFIGS.MAILER.SMTP_HOST === "smtp.ethereal.email") {
                console.log(`:::> Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
            }

            return info;
        });
    }
}

// export a singleton instance of the mailer (to avoid creating multiple connections)
const mailer = Mailer.getInstance();

export default mailer;
