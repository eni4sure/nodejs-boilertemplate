import { Request, Response } from "express";

import response from "@/utilities/response";
import AuthService from "@/services/v1/auth.service";

class AuthController {
    async register(req: Request, res: Response) {
        const result = await AuthService.register(req);
        res.status(201).send(response("new user registered", result));
    }

    async login(req: Request, res: Response) {
        const result = await AuthService.login(req);
        res.status(200).send(response("user login successful", result));
    }

    async verifyEmail(req: Request, res: Response) {
        const result = await AuthService.verifyEmail(req);
        res.status(200).send(response("email verification successful", result));
    }

    async requestEmailVerification(req: Request, res: Response) {
        const result = await AuthService.requestEmailVerification(req);
        res.status(200).send(response("email verification requested", result));
    }

    async requestPasswordReset(req: Request, res: Response) {
        const result = await AuthService.requestPasswordReset(req);
        res.status(200).send(response("password reset requested", result));
    }

    async confirmPasswordResetOtp(req: Request, res: Response) {
        const result = await AuthService.confirmPasswordResetOtp(req);
        res.status(200).send(response("password reset otp confirmed", result));
    }

    async resetPassword(req: Request, res: Response) {
        const result = await AuthService.resetPassword(req);
        res.status(200).send(response("password updated", result));
    }

    async refreshTokens(req: Request, res: Response) {
        const result = await AuthService.refreshTokens(req);
        res.status(200).send(response("tokens refreshed", result));
    }

    async logout(req: Request, res: Response) {
        const result = await AuthService.logout(req);
        res.status(200).send(response("user logged out", result));
    }
}

export default new AuthController();
