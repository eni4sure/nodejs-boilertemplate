import multer from "multer";
import * as Sentry from "@sentry/node";
import response from "@/utilities/response";
import { Express, NextFunction, Request, Response } from "express";

const configureErrorMiddleware = (app: Express): Express => {
    // Sentry error handler
    app.use(Sentry.Handlers.errorHandler());

    // Handle 404 requests
    app.use("*", (_req: Request, res: Response) => {
        res.status(404).send(response("Invalid request", null, false));
    });

    // Handle errors middleware
    app.use((error: Error, _req: Request, res: Response, next: NextFunction) => {
        // Handle custom errors
        if (error.name == "CustomError" && (error as any).status) {
            res.status((error as any).status).send(response(error.message, null, false));
        } else if (error instanceof multer.MulterError) {
            if (error.code === "LIMIT_FILE_SIZE") error.message = "file too large";
            if (error.code === "LIMIT_FILE_COUNT") error.message = "too many files uploaded";

            res.status(400).send(response(error.message, null, false));
        } else if (error.name == "MongoError" && (error as any).code == 11000) {
            // Catch duplicate key field error
            const field = Object.entries((error as any).keyValue)[0]?.[0];
            res.status(400).send(response(`${field} already exists`, null, false));
        } else if (error.name == "CastError") {
            res.status(400).send(response("resource does not exist", null, false));
        } else if (["JsonWebTokenError", "ValidationError", "SyntaxError", "MongooseError", "MongoError"].includes(error.name)) {
            res.status(400).send(response(error.message, null, false));
        } else {
            res.status(500).send(response(error.message, null, false));
        }

        next();
    });

    return app;
};

export { configureErrorMiddleware };
