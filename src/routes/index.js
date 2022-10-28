const router = require("express").Router();

// Trim all incoming requests
router.use(require("./../middlewares/trim-incoming-requests.middleware"));

router.use("/auth", require("./auth.route"));

router.use("/users", require("./user.route"));

router.get("/", (req, res) => {
    return res.status(200).json({ message: "Hello world from node-express-starter! :)" });
});

// Allow Playground to be accessed in development
if (process.env.NODE_ENV === "development") {
    router.use("/playground", async (req, res) => {
        const results = {};
        res.json(results);
    });
}

module.exports = router;
