const router = require("express").Router();

// Trim all incoming requests
router.use(require("./../middlewares/trim-incoming-requests.middleware"));

router.use("/auth", require("./auth.route"));

router.use("/users", require("./user.route"));

router.get("/", (req, res) => {
    return res.status(200).json({ message: "Hello world from node-express-starter! :)" });
});

module.exports = router;
