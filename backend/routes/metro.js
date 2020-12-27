export default (app) => {
    app.get("/metro", (req, res) => {
        res.status(501).json({ message: "Metro is not yet implemented." });
    });
};
