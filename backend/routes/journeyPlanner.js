export default (app) => {
    app.get("/journey", async (req, res) => {
        res.setHeader("Content-Type", "application/json");

        res.status(501).json({ message: "Not yet implemented" });
    });

    app.get("/journey/:from/to/:to", async (req, res) => {
        res.setHeader("Content-Type", "application/json");

        res.status(501).json({ message: "Not yet implemented" });
    });
};
