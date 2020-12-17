import mongoose from 'mongoose';
import {
    searchTrainStations,
    getTrainStationFromCrs,
    getAllTrainStations
} from '../db/schemas/Station.factory';
import {
    searchBikePoints,
    getBikePointFromId,
    getAllBikePoints
} from '../db/schemas/BikePoint.factory';

export default class departrDBAPI {
    constructor(DB_URL, DB_NAME) {
        this.dbOpen = false;

        const conn = () => {
            mongoose.connect(`mongodb://${DB_URL}/${DB_NAME}`, {
                useNewUrlParser: true,
                useFindAndModify: true,
                useCreateIndex: true,
                useUnifiedTopology: true
            });

            // @ts-ignore
            const db = mongoose.connection;
            db.on('error', (err) => {
                console.error("Failed to connect to database. Retrying in 5 seconds...");
                setTimeout(conn, 5000);
            });

            db.on('open', () => {
                console.log("Connected to database.");
                this.dbOpen = true;
            });
        };

        conn();
    }

    // ---- Train ----
    // Stations
    searchTrainStations(query) {
        return searchTrainStations(query);
    }

    getTrainStationDetails(crs) {
        return getTrainStationFromCrs(crs);
    }

    getAllTrainStations() {
        return getAllTrainStations();
    }
    // Services
    //todo

    // ---- Bike ----
    searchBikePoints(query) {
        return searchBikePoints(query);
    }
    getBikePointDetails(id) {
        return getBikePointFromId(id);
    }
    getAllBikePoints() {
        return getAllBikePoints();
    }
}