require("express-async-errors");
const app = require("express")();

// Pre-route middlewares
require("./middlewares/pre-route.middleware")(app);

// Uncomment to add 5 seconds delay to routes // For Testing Only
// app.use((req, res, next) => setTimeout(next, 5000));

// routes
app.use(require("./routes"));

// Error middlewares
require("./middlewares/error.middleware")(app);

const PORT = process.env.PORT || 4000;

// Listen to server port
app.listen(PORT, async () => {
    // Initialize MongoDB connection
    require("./database/mongo");

    console.log(`:::> Server listening on port ${PORT} @ http://localhost:${PORT}`);
});

// On server error
app.on("error", (error) => {
    console.error(`<::: An error occurred on the server: \n ${error}`);
});

module.exports = app;
