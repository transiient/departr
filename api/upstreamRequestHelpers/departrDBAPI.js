const mongoose = require('mongoose');
const StationFactory = require('../db/schemas/Station.factory');
const NominatimAPI = require('../upstreamRequestHelpers/NominatimAPI').NominatimAPI;

class departrDBAPI {
    constructor(DB_URL, DB_NAME) {
        this.dbOpen = false;
        mongoose.connect(`mongodb://${DB_URL}/${DB_NAME}`, {
            useNewUrlParser: true,
            useFindAndModify: true,
            useCreateIndex: true,
            useUnifiedTopology: true
        });
        const db = mongoose.connection;

        db.on('error', err => console.error(err));
        db.on('open', () => this.dbOpen = true);
    }

    getStationDetails(crs) {
        return StationFactory.getStationFromCrs(crs)
            .catch((err) => console.error(err));
    }

    getAllStationDetails() {
        return StationFactory.getAllStations()
            .catch((err) => console.error(err));
    }
}

module.exports = {
    departrDBAPI
};