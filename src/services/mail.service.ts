import mailer from "@/libraries/mailer";
import { IUser } from "@/models/user.model";
import { render } from "@react-email/components";

import WelcomeUserEmail from "@/email-templates/welcome-user";
import VerificationLinkEmail from "@/email-templates/verification-link";
import PasswordResetEmail from "@/email-templates/password-reset";

class MailService {
    async sendWelcomeUserEmail(context: { user: Pick<IUser, "_id" | "firstName" | "email">; verificationToken: string }) {
        const emailProp = {
            firstName: context.user.firstName,
            verificationLink: `http://localhost:3000/auth/verify-email?verificationToken=${context.verificationToken}&userId=${context.user._id}`,
        };

        return await mailer.sendMail({
            to: context.user.email,
            subject: "Welcome to nodejs-boilertemplate",
            text: render(WelcomeUserEmail(emailProp), { plainText: true }),
            html: render(WelcomeUserEmail(emailProp)),
        });
    }

    async sendVerificationLinkEmail(context: { user: Pick<IUser, "_id" | "firstName" | "email">; verificationToken: string }) {
        const emailProp = {
            firstName: context.user.firstName,
            verificationLink: `http://localhost:3000/auth/verify-email?verificationToken=${context.verificationToken}&userId=${context.user._id}`,
        };

        return await mailer.sendMail({
            to: context.user.email,
            subject: "Verify your email address",
            text: render(VerificationLinkEmail(emailProp), { plainText: true }),
            html: render(VerificationLinkEmail(emailProp)),
        });
    }

    async sendPasswordResetEmail(context: { user: Pick<IUser, "_id" | "firstName" | "email">; resetToken: string }) {
        const emailProp = {
            firstName: context.user.firstName,
            resetLink: `http://localhost:3000/auth/reset-password?resetToken=${context.resetToken}&userId=${context.user._id}`,
        };

        return await mailer.sendMail({
            to: context.user.email,
            subject: "Reset your password",
            text: render(PasswordResetEmail(emailProp), { plainText: true }),
            html: render(PasswordResetEmail(emailProp)),
        });
    }
}

export default new MailService();
