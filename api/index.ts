console.clear();
console.log("\n\nLaunching departr API...\n");

import express, { Request as Req, Response as Res } from 'express';

import departrDBAPI from './upstreamRequestHelpers/departrDBAPI';
import NominatimAPI from './upstreamRequestHelpers/NominatimAPI';
import LdbwsAPI from './upstreamRequestHelpers/LdbwsAPI';
import Station from './types/Train/Station';

// Routes
import __TRAINROUTES__ from './routes/train';
import __CYCLEROUTES__ from './routes/bike';
import __BUSROUTES__ from './routes/bus';
import __METROROUTES__ from './routes/metro';
import __JOURNEYPLANNERROUTES__ from './routes/journeyPlanner';
const ROUTES = {
    train: __TRAINROUTES__,
    cycle: __CYCLEROUTES__,
    bus: __BUSROUTES__,
    metro: __METROROUTES__,
    journeyPlanner: __JOURNEYPLANNERROUTES__
};

console.log("\tSetting environment variables...");
require('dotenv').config();
console.log("\tInitialising express...");
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

const {
    API_PORT,
    LDBWS_TOKEN,
    ORD_USERNAME,
    ORD_PASSWORD,
    DEPARTRDB_NAME,
    DEPARTRDB_URL
} = process.env;

if (API_PORT === null || LDBWS_TOKEN === null || ORD_USERNAME === null || ORD_PASSWORD === null) {
    console.error("Required environment variable(s) not set");
    console.log("Please copy /example.env to /.env and insert the required environment variables.");
    console.log("   departr API cannot run without these variables set.");
}

console.log("\tRegistering LdbwsAPI...");
const ldbwsAPI = new LdbwsAPI(LDBWS_TOKEN || '');
console.log("\tConnecting to departr database asynchronously...");
const departrDB = new departrDBAPI(DEPARTRDB_URL || '', DEPARTRDB_NAME || '');

console.log("\tRegistering middleware...");
app.use(cors());
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/*
    ---- ROUTES ----
*/
app.get('/', (req: Req, res: Res) => {
    res.setHeader('Content-Type', 'application/json');

    res.json({
        "message": "departr API is live, and you're connected.",
        // "routes": [
        //     "/",
        //     "/train/:crs/details",
        //     "/train/:crs/services",
        //     "/search/:query"
        // ]
    });
});

// Train
ROUTES.train(app, ldbwsAPI);
ROUTES.cycle(app);
ROUTES.bus(app);
ROUTES.metro(app);
ROUTES.journeyPlanner(app);

//* Search stations
app.get('/search/:searchQuery', async (req: Req, res: Res) => {
    res.setHeader('Content-Type', 'application/json');

    const searchQuery = req.params.searchQuery;
    const {
        type,
        distance,
        showNearby,
        sort
    } = req.query;

    try {
        const results = await Station.search(searchQuery);
        let nearby = []
        if (req.query.showNearby) {
            const latLong = await NominatimAPI.getLatLongFromAddressSearch(searchQuery);
            nearby = await Station.closestTo(latLong, 5);
        }
        res.json([...results, ...nearby]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ "message": err.message });
    }
});

// Run app
app.listen(API_PORT, () => {
    console.log("\n>> API is running on port [" + API_PORT + "]");
});