export default (app) => {
    app.get("/bus", (req, res) => {
        res.status(501).json({ message: "Bus is not yet implemented." });
    });
};
