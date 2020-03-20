console.clear();
console.log("\n\nLaunching departr API...\n");

import express, { Request as Req, Response as Res } from 'express';

import { NominatimAPI } from './upstreamRequestHelpers/NominatimAPI';
import { Station } from './classes/Station';

console.log("\tSetting environment variables...");
require('dotenv').config();
console.log("\tInitialising express...");
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

// Classes
const LdbwsAPI = require('./upstreamRequestHelpers/LdbwsAPI');

// Data
const StationCodes = require('../src/data/station_codes.json');

const {
    API_PORT,
    LDBWS_TOKEN,
    ORD_USERNAME,
    ORD_PASSWORD
} = process.env;

if (API_PORT === null || LDBWS_TOKEN === null || ORD_USERNAME === null || ORD_PASSWORD === null) {
    console.error("Required environment variable(s) not set");
    console.log("Please copy /example.env to /.env and insert the required environment variables.");
    console.log("   departr API cannot run without these variables set.");
}

console.log("\tRegistering LdbwsAPI...");
const ldbwsAPI = new LdbwsAPI(LDBWS_TOKEN);

console.log("\tRegistering middleware...");
app.use(cors());
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/* ************** */
/* Static methods */
/* ************** */
//* Check if the provided CRS value actually exists
//todo: (#11) remove and replace with fromCrs
function isStationCrsValid(crs: string) {
    return StationCodes.filter((station: any) => station.crs === crs);
}
//* Search stations
async function searchTrainStations(query: string) {
    try {
        const searchResults = await Station.search(query);
        return searchResults.map((result: any) => {
            return new Station(
                result.crs,
                result.name,
                result.location,
                result.staffing
            );
        });
    } catch (err) {
        throw (err);
    }
}
//* Search for the stations closest to a point
async function findNearbyTrainStations(query: string) {
    // todo: search for various types of stations
    try {
        // todo: strict type
        const latLongFromAddress: any = await NominatimAPI.getLatLongFromAddressSearch(query);
        return await Station.findNearest(latLongFromAddress, 5);
    } catch (err) {
        throw (err);
    }
}

/*
    Hello world
*/
app.get('/', (req: Req, res: Res) => {
    res.send("departr API - try /train-station/details/CLJ - documentation coming soon");
});

//* Get details for provided CRS
app.get('/train-station/details/:crs', async (req: Req, res: Res) => {
    res.setHeader('Content-Type', 'application/json');

    try {
        const station = await Station.fromCrs(req.params.crs);
        res.json(station);
    } catch (err) {
        console.error(err.message);
        res.status(500).json(err.message);
    }
});

//* Get services for provided CRS
app.get('/train-station/services/:crs', async (req: Req, res: Res) => {
    res.setHeader('Content-Type', 'application/json');

    if (!isStationCrsValid) {
        res.status(404).json({ message: "Station CRS does not exist" });
        return;
    }

    // todo: consider tidying services in ldbwsapi.ts
    try {
        const services = await ldbwsAPI.getDepartures(req.params.crs);
        res.json(services);
    } catch (err) {
        console.error(err);
        if (err.message === 'soap:Server: Unexpected server error') {
            res.status(404).json('This station likely does not exist');
        } else {
            res.status(500).json(err.message);
        }
    }
});

// app.get('/train-station/station/next-departure/:crs', ...

app.get('/train-station/search/:crs', async (req: Req, res: Res) => {
    res.setHeader('Content-Type', 'application/json');

    try {
        const results = await searchTrainStations(req.params.crs);
        res.json(results);
    } catch (err) {
        console.error(err.message);
        res.status(500).json(err.message);
    }
});
// todo: improve API endpoint naming (this can be addressed in wiki API docs)
app.get('/find-nearby/:type/:query', async (req: Req, res: Res) => {
    res.setHeader('Content-Type', 'application/json');

    if (req.params.type !== 'train') {
        res.status(400).json('type must be "train"');
    }

    try {
        const nearby: any = await findNearbyTrainStations(req.params.query);
        res.json(await nearby.map((station: any) => {
            return {
                distanceMi: station.distanceMi,
                ...station.data
            };
        }));
    } catch (err) {
        console.error(err.message);
        res.status(500).json(err.message);
    }
});

// Run app
app.listen(API_PORT, () => {
    console.log("\n>> API is running on port [" + API_PORT + "]");
});