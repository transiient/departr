export default (app, ldbwsAPI) => {
    //* Station details
    app.get("/rail/:crs/details", async (req, res) => {
        res.setHeader("Content-Type", "application/json");

        try {
            const station = await RailStation.fromCrs(req.params.crs);
            res.json(station);
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ message: err.message });
        }
    });

    //* Station services
    app.get("/rail/:crs/services", async (req, res) => {
        res.setHeader("Content-Type", "application/json");

        try {
            const services = await ldbwsAPI.getDepartures(req.params.crs);
            res.json(services);
        } catch (err) {
            console.error(err);
            if (err.message === "soap:Server: Unexpected server error") {
                res.status(404).json({ message: "This station likely does not exist" });
            } else {
                console.error(err.message);
                res.status(500).json({ message: err.message });
            }
        }
    });
};
