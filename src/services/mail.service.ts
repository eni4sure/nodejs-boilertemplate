import { render } from "@react-email/components";

import { CONFIGS } from "@/configs";
import { IUser } from "@/models/user.model";
import nodemailerInstance from "@/libraries/nodemailer";

import WelcomeUserEmail from "@/email-templates/v1/welcome-user-email";
import VerificationLinkEmail from "@/email-templates/v1/verification-link-email";
import PasswordResetLinkEmail from "@/email-templates/v1/password-reset-link-email";

class MailService {
    async sendWelcomeUserEmail(context: { user: Pick<IUser, "_id" | "first_name" | "email">; verificationToken: string }) {
        const emailProp = {
            firstName: context.user.first_name,
            verificationLink: `${CONFIGS.URL.AUTH_BASE_URL}/auth/verify-email?verification_otp=${context.verificationToken}&user_id=${context.user._id}`,
        };

        return await nodemailerInstance.sendMail({
            to: context.user.email,
            subject: "Welcome to nodejs-boilertemplate",
            text: render(WelcomeUserEmail(emailProp), { plainText: true }),
            html: render(WelcomeUserEmail(emailProp)),
        });
    }

    async sendVerificationLinkEmail(context: { user: Pick<IUser, "_id" | "first_name" | "email">; verificationToken: string }) {
        const emailProp = {
            firstName: context.user.first_name,
            verificationLink: `${CONFIGS.URL.AUTH_BASE_URL}/auth/verify-email?verification_otp=${context.verificationToken}&user_id=${context.user._id}`,
        };

        return await nodemailerInstance.sendMail({
            to: context.user.email,
            subject: "Verify your email address",
            text: render(VerificationLinkEmail(emailProp), { plainText: true }),
            html: render(VerificationLinkEmail(emailProp)),
        });
    }

    async sendPasswordResetLinkEmail(context: { user: Pick<IUser, "_id" | "first_name" | "email">; resetToken: string }) {
        const emailProp = {
            firstName: context.user.first_name,
            resetLink: `${CONFIGS.URL.AUTH_BASE_URL}/auth/reset-password?reset_otp=${context.resetToken}&user_id=${context.user._id}`,
        };

        return await nodemailerInstance.sendMail({
            to: context.user.email,
            subject: "Reset your password",
            text: render(PasswordResetLinkEmail(emailProp), { plainText: true }),
            html: render(PasswordResetLinkEmail(emailProp)),
        });
    }
}

// // For testing purposes, uncomment code below and run `yarn start`
// new MailService().sendWelcomeUserEmail({
//     user: {
//         _id: "5f9b3b1b9b3b1b9b3b1b9b3b",
//         firstName: "John",
//         email: "", // Add your email here to test
//     },
//     verificationToken: "5f9b3b1b9b3b1b9b3b1b9b3b",
// });

export default new MailService();
