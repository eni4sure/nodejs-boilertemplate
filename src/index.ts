import "express-async-errors";
import express, { Express } from "express";

import routes from "@/routes";
import mailer from "@/libraries/mailer";
import { connectMongoDB } from "@/libraries/mongo";
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
    // Initialize MongoDB connection
    await connectMongoDB();

    // Initialize mailer connection
    await mailer.verifyConnection()

    console.log(`:::> Server listening on port ${PORT} @ http://localhost:${PORT}`);
});

// On server error
app.on("error", (error) => {
    console.error(`<::: An error occurred on the server: \n ${error}`);
});

export default app;
