import crypto from "crypto";
import * as Sentry from "@sentry/node";
import { Upload } from "@aws-sdk/lib-storage";
import { SESClient } from "@aws-sdk/client-ses";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, ObjectCannedACL, DeleteObjectCommand, GetObjectCommand, CompleteMultipartUploadCommandOutput } from "@aws-sdk/client-s3";

import { CONFIGS, DEPLOYMENT_ENV } from "@/configs";

interface DeleteFileOptions {
    s3Bucket: string;
    Location: string | null;
}

interface GetSignedUrlOptions {
    s3Bucket: string;
    Location: string;
    Expires?: number;
}

interface UploadFileOptions {
    s3Bucket: string;
    file: Express.Multer.File;

    folder: string;
    fileName?: string;
    ACL?: ObjectCannedACL;
}

// AWS SES
// =============================================================================

export const sesClient = new SESClient({
    region: "eu-west-2", // TODO: replace with the appropriate region
    credentials: {
        accessKeyId: CONFIGS.AWS.ACCESS_KEY_ID as string,
        secretAccessKey: CONFIGS.AWS.SECRET_ACCESS_KEY as string,
    },
});

// AWS S3
// =============================================================================

const s3Client = new S3Client({
    region: "eu-west-1", // TODO: replace with the appropriate region
    credentials: {
        accessKeyId: CONFIGS.AWS.ACCESS_KEY_ID as string,
        secretAccessKey: CONFIGS.AWS.SECRET_ACCESS_KEY as string,
    },
});

export const deleteFileFromS3 = async ({ s3Bucket, Location }: DeleteFileOptions) => {
    if (!Location || !Location.includes(s3Bucket)) return;

    const params = {
        Bucket: s3Bucket,
        Key: Location.split("amazonaws.com/").pop() as string,
    };

    try {
        await s3Client.send(new DeleteObjectCommand(params));

        return true;
    } catch (error: any) {
        Sentry.captureException(new Error("From Third-Party: fn (deleteFileFromS3)"), { extra: { params, response: error }, level: "error" });
        return false;
    }
};

export const uploadFileToS3 = async ({ s3Bucket, file, folder, fileName, ACL = "private" }: UploadFileOptions) => {
    const finalFileName = fileName ? fileName : `${crypto.randomBytes(30).toString("hex")}`;

    const params = {
        ACL,
        Bucket: s3Bucket,
        Body: file.buffer,
        ContentType: file.mimetype,
        Key: `${DEPLOYMENT_ENV}/${folder}/${finalFileName}`,
    };

    try {
        const uploadData = new Upload({
            client: s3Client,
            params: params,
            leavePartsOnError: false,
        });

        const data = (await uploadData.done()) as CompleteMultipartUploadCommandOutput;

        if (!data.Location) return null;

        return data.Location;
    } catch (error: any) {
        Sentry.captureException(new Error("From Third-Party: fn (uploadFileToS3)"), { extra: { params, response: error }, level: "error" });
        return null;
    }
};

export const getSignedUrlFromS3 = async ({ s3Bucket, Location, Expires = 60 * 60 * 24 }: GetSignedUrlOptions) => {
    if (!Location.includes(s3Bucket)) return null;

    const params = {
        Bucket: s3Bucket,
        Key: Location.split("amazonaws.com/").pop(),
    };

    try {
        const signedUrl = await getSignedUrl(s3Client, new GetObjectCommand(params), { expiresIn: Expires });

        return signedUrl;
    } catch (error: any) {
        Sentry.captureException(new Error("From Third-Party: fn (getSignedUrlFromS3)"), { extra: { params, response: error }, level: "error" });
        return null;
    }
};
