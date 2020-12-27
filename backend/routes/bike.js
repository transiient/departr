export default (app) => {
    app.get("/bikepoint/tfl/:bikePointId", async (req, res) => {
        res.setHeader("Content-Type", "application/json");

        try {
            let bikePoint = await BikePoint.fromId(req.params.bikePointId);
            res.json(bikePoint);
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ message: err.message });
        }
    });
};
