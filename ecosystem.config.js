module.exports = {
    apps: [
        {
            name: "node-express-starter",
            script: "src/index.js",
            exec_mode: "cluster",
            instances: 0,
            watch: ".",
            ignore_watch: ["node_modules"]
        }
    ]
};
