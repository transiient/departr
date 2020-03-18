console.clear();
console.log("Launching departr API...\n\n");

import express, { Request as Req, Response as Res } from 'express';

import { NominatimAPI } from './upstreamRequestHelpers/NominatimAPI';
import { Station } from './classes/Station';
import { Service, CallingPoint } from './classes/Service';

require('dotenv').config();
const uniq = require('lodash/uniq');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

// Classes
const LdbwsAPI = require('./upstreamRequestHelpers/LdbwsAPI');

// Data
const StationCodes = require('../src/data/station_codes.json');
const TrainOperatingCompanies = require('../src/data/train_operating_companies.json');

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

const ldbwsAPI = new LdbwsAPI(LDBWS_TOKEN);

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

//* Check if the train is running on time
function isOnTime(scheduled: string, expected: string) {
    //? NRE could return various values for the expected time.
    if (expected.toLowerCase() === "on time") return true;
    if (expected === scheduled) return true;
    return false;
}
//* Get the true expected time of the train, whether on time or not
function getExpectedTime(scheduled: string, expected: string) {
    const onTime = (expected.toLowerCase() === "on time") || (expected === scheduled);
    const cancelled = (expected.toLowerCase() === "cancelled");
    const delayUnknown = (expected.toLowerCase() === "delayed");

    if (onTime) return scheduled;
    else if (cancelled) return scheduled;
    else if (delayUnknown) return "DELAY";
    else return expected;
}
//* Get the train operator's website URL
function getOperatorHomepageUrl(operatorCode: string) {
    const matchingToc = TrainOperatingCompanies.filter((operator: any) => operator.code === operatorCode);

    // todo: update to use KB API
    if (matchingToc.length > 0)
        return matchingToc[0].homepageUrl;
    return "";
}

/* ********** */
/* Formatters */
/* ********** */
async function formatCallingPoints(callingPoints: any): Promise<CallingPoint[]> {
    return await Promise.all(callingPoints.map(async (callingPoint: any) => {
        if (!callingPoint.et)
            callingPoint.et = (callingPoint.at || '');

        const station = await Station.fromCrs(callingPoint.crs);
        return new CallingPoint(
            station,
            (callingPoint.et || '').toLowerCase() === "cancelled",
            {
                scheduled: callingPoint.st,
                expected: getExpectedTime(callingPoint.st, callingPoint.et),
                onTime: isOnTime(callingPoint.st, callingPoint.et)
            }
        );
    }));
}

async function formatServices(services: any): Promise<Station[]> {
    try {
        return await Promise.all(services.map(async (service: any) => {
            const stationOrigin: Station = await Station.fromCrs(service.origin.location[0].crs);
            const stationDestination: Station = await Station.fromCrs(service.destination.location[0].crs);
            const callingPoints: CallingPoint[] = await formatCallingPoints(service.callingPoints);

            return new Service(
                service.serviceType,
                service.serviceID,
                service.rsid || '',
                {
                    name: service.operator,
                    code: service.operatorCode,
                    homepageUrl: getOperatorHomepageUrl(service.operatorCode)
                },
                stationOrigin,
                stationDestination,
                service.etd.toLowerCase() === "cancelled",
                {
                    scheduled: service.std,
                    expected: getExpectedTime(service.std, service.etd),
                    onTime: isOnTime(service.std, service.etd)
                },
                callingPoints,
                callingPoints.length === 1
            )
        }));
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
        const formattedServices = await formatServices(services);// this is causing an issue

        res.json(formattedServices);
    } catch (err) {
        console.error(err.message);
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
    console.log("\n\n\t>> API is running on port [" + API_PORT + "]\n");
});