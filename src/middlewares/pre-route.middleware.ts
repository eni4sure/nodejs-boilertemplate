import cors from "cors";
import path from "path";
import helmet from "helmet";
import morgan from "morgan";
import * as Sentry from "@sentry/node";
import express, { Express } from "express";
import { CONFIGS, DEPLOYMENT_ENV } from "@/configs";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

const configurePreRouteMiddleware = (app: Express): Express => {
    // Set Proxy
    app.set("trust proxy", true);

    // Initialize Sentry
    Sentry.init({
        dsn: CONFIGS.SENTRY.DSN,
        environment: DEPLOYMENT_ENV,
        release: CONFIGS.SENTRY.RELEASE,

        integrations: [
            // enable HTTP calls tracing
            new Sentry.Integrations.Http({ tracing: true }),

            // enable Express.js middleware tracing
            new Sentry.Integrations.Express({ app }),

            // Automatically instrument Node.js libraries and frameworks
            ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),

            // enable profiling
            nodeProfilingIntegration(),
        ],

        tracesSampleRate: 0.4, // % of transactions that will be sampled
        profilesSampleRate: 0.4, // % of transactions that will be profiled
    });

    // Sentry request handler of transactions for performance monitoring.
    app.use(Sentry.Handlers.requestHandler());

    // TracingHandler creates a trace for every incoming request
    app.use(Sentry.Handlers.tracingHandler());

    // enable CORS
    app.use(cors());

    // Secure the app by setting various HTTP headers off.
    app.use(helmet({ contentSecurityPolicy: false }));

    // Enable HTTP request logging
    app.use(morgan("common"));

    // Tell express to recognize the incoming Request Object as a JSON Object
    app.use(express.json());

    // Serve Public Folder
    app.use("/", express.static(path.join(__dirname, "..", "..", "public")));

    // Express body parser
    app.use(express.urlencoded({ extended: true }));

    return app;
};

export { configurePreRouteMiddleware };
