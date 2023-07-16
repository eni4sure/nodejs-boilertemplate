import crypto from "crypto";
import JWT from "jsonwebtoken";
import bcryptjs from "bcryptjs";

import { CONFIGS } from "@/configs";
import CustomError from "@/utilities/custom-error";
import UserModel, { IUser } from "@/models/user.model";
import TokenModel, { IToken } from "@/models/token.model";

class TokenService {
    async generateAuthTokens(user: Pick<IUser, "_id" | "role" | "email">) {
        // Generate random refresh token and hash it
        const refreshToken = crypto.randomBytes(32).toString("hex");

        // encrypt refresh token
        const hashedRefreshToken = await bcryptjs.hash(refreshToken, CONFIGS.BCRYPT_SALT);

        // Save refresh token in database
        await new TokenModel({ token: hashedRefreshToken, type: "refresh-token", userId: user._id, expiresAt: Date.now() + CONFIGS.REFRESH_TOKEN_JWT_EXPIRES_IN }).save();

        // Generate access token and refresh token JWT
        const accessToken = JWT.sign({ _id: user._id, role: user.role, email: user.email }, CONFIGS.JWT_SECRET, { expiresIn: CONFIGS.ACCESS_TOKEN_JWT_EXPIRES_IN / 1000 });
        const refreshTokenJWT = JWT.sign({ _id: user._id, refreshToken }, CONFIGS.JWT_SECRET, { expiresIn: CONFIGS.REFRESH_TOKEN_JWT_EXPIRES_IN / 1000 });

        return { accessToken, refreshToken: refreshTokenJWT };
    }

    async refreshAuthTokens(refreshTokenJWT: string) {
        // Decode refresh token
        const decodedRefreshToken = JWT.verify(refreshTokenJWT, CONFIGS.JWT_SECRET) as { _id: string; refreshToken: string };

        // Find refresh tokens for user in database
        const refreshTokens = await TokenModel.find({ userId: decodedRefreshToken._id, type: "refresh-token" });
        if (refreshTokens.length === 0) throw new CustomError("invalid / expired refresh token", 401);

        // Get user from database
        const user = await UserModel.findOne({ _id: decodedRefreshToken._id });
        if (!user) throw new CustomError("invalid user", 401);

        // for each refresh token, check if it matches the decoded refresh token
        for (const token of refreshTokens) {
            const isValid = await bcryptjs.compare(decodedRefreshToken.refreshToken, token.token as string);

            if (isValid) {
                // Delete the previous refresh token from database
                await TokenModel.deleteOne({ _id: token._id });

                // Generate new access token and refresh token JWT
                return await this.generateAuthTokens({ _id: user._id, role: user.role as any, email: user.email });
            }
        }

        throw new CustomError("invalid / expired refresh token", 401);
    }

    async revokeRefreshToken(refreshTokenJWT: string) {
        // Decode refresh token
        const decodedRefreshToken = JWT.verify(refreshTokenJWT, CONFIGS.JWT_SECRET) as { _id: string; refreshToken: string };

        // Find refresh tokens for user in database
        const refreshTokens = await TokenModel.find({ userId: decodedRefreshToken._id, type: "refresh-token" });
        if (refreshTokens.length === 0) return true;

        // for each refresh token, check if it matches the decoded refresh token
        for (const token of refreshTokens) {
            const isValid = await bcryptjs.compare(decodedRefreshToken.refreshToken, token.token as string);

            if (isValid) {
                // Delete the refresh token
                await TokenModel.deleteOne({ _id: token._id });
                return true;
            }
        }

        return true;
    }

    async generateToken({ userId, tokenType }: { userId: string; tokenType: Exclude<IToken["type"], "refresh-token"> }) {
        // find and delete any existing token
        await TokenModel.findOneAndDelete({ userId: userId, type: tokenType });

        // Generate random code and token
        const code = crypto.randomBytes(3).toString("hex").toUpperCase();
        const token = crypto.randomBytes(32).toString("hex");

        // encrypt the generated code and token
        const hashedCode = await bcryptjs.hash(code, CONFIGS.BCRYPT_SALT);
        const hashedToken = await bcryptjs.hash(token, CONFIGS.BCRYPT_SALT);

        // Save the encrypted code and token in database
        await new TokenModel({ code: hashedCode, token: hashedToken, type: tokenType, userId: userId, expiresAt: Date.now() + CONFIGS.DEFAULT_DB_TOKEN_EXPIRY_DURATION }).save();

        // Return the unencrypted code and token
        return { code, token };
    }

    async verifyToken({ code, token, userId, tokenType }: { code?: string; token?: string; userId: string; tokenType: IToken["type"] }) {
        // Find token in database
        const dbToken = await TokenModel.findOne({ userId: userId, type: tokenType });

        // If no token found, return false
        if (!dbToken) return false;

        // Check if code and token matches
        const isCodeValid = await bcryptjs.compare(String(code), String(dbToken.code));
        const isTokenValid = await bcryptjs.compare(String(token), String(dbToken.token));

        // If code and token is invalid, return false
        if (!isCodeValid && !isTokenValid) return false;

        // If code and token is valid, delete the token
        await TokenModel.deleteOne({ userId: userId, type: tokenType });

        return true;
    }
}

export default new TokenService();
