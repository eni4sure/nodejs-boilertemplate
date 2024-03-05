import crypto from "crypto";
import JWT from "jsonwebtoken";
import bcryptjs from "bcryptjs";

import { CONFIGS } from "@/configs";
import CustomError from "@/utilities/custom-error";
import UserModel, { IUser } from "@/models/user.model";
import TokenModel, { IToken, TOKEN_TYPES } from "@/models/token.model";

class TokenService {
    async generateAuthTokens(user: Pick<IUser, "_id">) {
        // Generate random refresh-token and hash it
        const refreshToken = crypto.randomBytes(32).toString("hex");

        // encrypt refresh-token
        const hashedRefreshToken = await bcryptjs.hash(refreshToken, CONFIGS.BCRYPT_SALT);

        // Save refresh-token in database
        await new TokenModel({ token: hashedRefreshToken, type: TOKEN_TYPES.REFRESH_TOKEN, user_id: user._id, expiresAt: Date.now() + CONFIGS.REFRESH_TOKEN_JWT_EXPIRES_IN }).save();

        // Generate access token and refresh-token JWT
        const accessTokenJWT = JWT.sign({ _id: user._id }, CONFIGS.JWT_SECRET, { expiresIn: CONFIGS.ACCESS_TOKEN_JWT_EXPIRES_IN / 1000 });
        const refreshTokenJWT = JWT.sign({ _id: user._id, refreshToken: refreshToken }, CONFIGS.JWT_SECRET, { expiresIn: CONFIGS.REFRESH_TOKEN_JWT_EXPIRES_IN / 1000 });

        return { access_token: accessTokenJWT, refresh_token: refreshTokenJWT };
    }

    async refreshAuthTokens(refreshTokenJWT: string) {
        // Decode refresh-token
        const decodedRefreshToken = JWT.verify(refreshTokenJWT, CONFIGS.JWT_SECRET, (err: any, decoded: any) => {
            if (err) throw new CustomError("-middleware/token-expired", 401);
            return decoded;
        }) as unknown as { _id: string; refreshToken: string };

        // Find refresh-tokens for user in database
        const refreshTokens = await TokenModel.find({ user_id: decodedRefreshToken._id, type: TOKEN_TYPES.REFRESH_TOKEN });
        if (refreshTokens.length === 0) throw new CustomError("-invalid-expired-token", 401);

        // Get user from database
        const user = await UserModel.findOne({ _id: decodedRefreshToken._id });
        if (!user) throw new CustomError("-invalid-expired-token", 401);

        // for each refresh-token, check if it matches the decoded refresh-token
        for (const singleToken of refreshTokens) {
            const isValid = await bcryptjs.compare(decodedRefreshToken.refreshToken, String(singleToken.token));

            if (isValid === true) {
                // Delete the previous refresh-token from database
                await TokenModel.deleteOne({ _id: singleToken._id });

                // Generate new access token and refresh-token JWT
                return await this.generateAuthTokens({ _id: user._id });
            }
        }

        throw new CustomError("-invalid-expired-token", 401);
    }

    async revokeRefreshToken(refreshTokenJWT: string) {
        // Decode refresh-token
        const decodedRefreshToken = JWT.verify(refreshTokenJWT, CONFIGS.JWT_SECRET) as { _id: string; refreshToken: string };

        // Find refresh-tokens for user in database
        const refreshTokens = await TokenModel.find({ user_id: decodedRefreshToken._id, type: TOKEN_TYPES.REFRESH_TOKEN });
        if (refreshTokens.length === 0) return false;

        // for each refresh-token, check if it matches the decoded refresh-token
        for (const singleToken of refreshTokens) {
            const isValid = await bcryptjs.compare(decodedRefreshToken.refreshToken, String(singleToken.token));

            if (isValid === true) {
                // Delete the refresh-token
                await TokenModel.deleteOne({ _id: singleToken._id });

                return true;
            }
        }

        return false;
    }

    async generateOtpToken({ userId, tokenType }: { userId: string; tokenType: Exclude<IToken["type"], "refresh-token"> }) {
        // find and delete any existing token of the same type
        await TokenModel.findOneAndDelete({ user_id: userId, type: tokenType });

        // generate random code and token
        const token = crypto.randomBytes(32).toString("hex");
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // encrypt the generated code and token
        const hashedCode = await bcryptjs.hash(code, CONFIGS.BCRYPT_SALT);
        const hashedToken = await bcryptjs.hash(token, CONFIGS.BCRYPT_SALT);

        // save the encrypted code and token in database
        await new TokenModel({ code: hashedCode, token: hashedToken, type: tokenType, user_id: userId, expiresAt: Date.now() + CONFIGS.DEFAULT_DB_TOKEN_EXPIRY_DURATION }).save();

        // return the unencrypted code and token
        return { code, token };
    }

    async verifyOtpToken({ code, token, userId, tokenType, deleteIfValidated }: { code?: string; token?: string; userId: string; tokenType: IToken["type"]; deleteIfValidated: boolean }) {
        // Find token in database
        const dbToken = await TokenModel.findOne({ user_id: userId, type: tokenType });

        // If no token found, return false
        if (!dbToken) return false;

        // Check if code and token matches
        const isCodeValid = await bcryptjs.compare(String(code), String(dbToken.code));
        const isTokenValid = await bcryptjs.compare(String(token), String(dbToken.token));

        // If code and token is invalid, return false
        if (isCodeValid !== true && isTokenValid !== true) return false;

        if (deleteIfValidated === true) {
            // If code and token is valid, delete the token
            await TokenModel.deleteOne({ user_id: userId, type: tokenType });
        }

        return true;
    }
}

export default new TokenService();
