// set timezone
process.env.TZ = "Africa/Lagos";

import "express-async-errors";
import express, { Express } from "express";

import routes from "@/routes";
import { redisClient } from "@/libraries/redis";
import { connectMongoDB } from "@/libraries/mongodb";
import nodemailerInstance from "@/libraries/nodemailer";
import { configureErrorMiddleware } from "@/middlewares/error.middleware";
import { configurePreRouteMiddleware } from "@/middlewares/pre-route.middleware";

const app: Express = express();

// Pre Route Middlewares
configurePreRouteMiddleware(app);

// Uncomment to add 5 seconds delay to routes // For Testing Only
// app.use((_req, _res, next) => setTimeout(next, 5000));

// Routes
app.use(routes);

// Error middlewares
configureErrorMiddleware(app);

const PORT: number | string = process.env.PORT || 4000;

// Listen to server port
app.listen(PORT, async () => {
    // verify mailer connection
    await nodemailerInstance.verifyConnection();

    // Initialize Redis connection
    await redisClient.connect();

    // Initialize MongoDB connection
    await connectMongoDB();

    console.log(`:::> Server listening on port ${PORT} @ http://localhost:${PORT} in ${String(process.env.NODE_ENV)} mode <:::`);
});

// On server error
app.on("error", (error) => {
    console.error(`<::: An error occurred on the server: \n ${error}`);
});

export default app;
