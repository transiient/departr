/*
    Search and Nearby
*/

export default (app, ldbwsAPI) => {
    app.get("/search/:searchQuery", async (req, res) => {
        res.setHeader("Content-Type", "application/json");

        const searchQuery = req.params.searchQuery;
        const { type, distance, limitNearby = 0, sort } = req.query;
        // type could be: null (any), rail, bike, metro, bus

        try {
            let results = [];

            switch (type) {
                case "rail":
                    results += await RailStation.search(searchQuery);
                default:
                    // Search everything
                    results += await RailStation.search(searchQuery);
            }

            // Add nearby results
            if (limitNearby > 0) {
                const latLong = await NominatimAPI.getLatLongFromAddressSearch(searchQuery);

                switch (type) {
                    case "rail":
                        results += await RailStation.closestTo(latLong, limitNearby);
                    default:
                        results += await RailStation.closestTo(latLong, limitNearby);
                }
            }

            res.json(results);
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ message: err.message });
        }
    });
};
