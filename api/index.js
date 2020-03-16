require('dotenv').config();
const uniq = require('lodash/uniq');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

// Classes
const LdbwsAPI = require('./upstreamRequestHelpers/LdbwsAPI');
const NominatimAPI = require('./upstreamRequestHelpers/NominatimAPI').NominatimAPI;
const Station = require('./classes/Station').Station;
const { Service, CallingPoint } = require('./classes/Service');

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
function isStationCrsValid(crs) {
    return StationCodes.filter((station) => station.crs === crs);
}
//* Search stations
function searchTrainStations(query) {
    let _matchCrs = (StationCodes.filter((station) => (station["CRS Code"]).toLowerCase() === query.toLowerCase()));
    let _similar = (StationCodes.filter((station) => ((station["CRS Code"] + station["Station Name"]).toLowerCase().includes(query.toLowerCase()))));
    let data = uniq([..._matchCrs, ..._similar]).map((station) => {
        return new Station(station["CRS Code"]);
    });

    return new Promise((resolve, reject) => {
        resolve(data);
    });
}
//* Search for the stations closest to a point
async function findNearbyTrainStations(query) {
    // todo: search for various types of stations
    return new Promise((resolve, reject) => {
        NominatimAPI.getLatLongFromAddressSearch(query)
            .then((latLong) => {
                return resolve(Station.findNearest(latLong, 5));
            })
            .catch((err) => { return reject(err); });
    });
}

//* Check if the train is running on time
function isOnTime(scheduled, expected) {
    //? NRE could return various values for the expected time.
    if (expected.toLowerCase() === "on time") return true;
    if (expected === scheduled) return true;
    return false;
}
//* Get the true expected time of the train, whether on time or not
function getExpectedTime(scheduled, expected) {
    const onTime = (expected.toLowerCase() === "on time") || (expected === scheduled);
    const cancelled = (expected.toLowerCase() === "cancelled");
    const delayUnknown = (expected.toLowerCase() === "delayed");

    if (onTime) return scheduled;
    else if (cancelled) return scheduled;
    else if (delayUnknown) return "DELAY";
    else return expected;
}
//* Get the train operator's website URL
function getOperatorHomepageUrl(operatorCode) {
    const matchingToc = TrainOperatingCompanies.filter((operator) => operator.code === operatorCode);

    // todo: update to use KB API
    if (matchingToc.length > 0)
        return matchingToc[0].homepageUrl;
    return "";
}

/* ********** */
/* Formatters */
/* ********** */
//* Returns a Promise resolving to an array of callingPoints
async function formatCallingPoints(callingPoint) {
    //? NRE sometimes returns no calling points
    let callingPoints = [];

    if (!Array.isArray(callingPoint)) {
        //? Direct trains only have single callingPoint, and it's an OBJECT.
        callingPoints = [callingPoint];
    } else {
        callingPoints = callingPoint;
    }

    //? callingPoints.map returns an array of Promises.
    //? The result of these promises (an Promise resolving to an array of callingPoints) is then returned.
    return await Promise.all(callingPoints.map((callingPoint) => {
        if (!callingPoint.et)
            callingPoint.et = (callingPoint.at || '');

        return new Promise((resolve, reject) => {
            Station.fromCrs(callingPoint.crs)
                .then(station => {
                    resolve(new CallingPoint(
                        station,
                        (callingPoint.et || '').toLowerCase() === "cancelled",
                        {
                            scheduled: callingPoint.st,
                            expected: getExpectedTime(callingPoint.st, callingPoint.et),
                            onTime: isOnTime(callingPoint.st, callingPoint.et)
                        }
                    ));
                })
                .catch(err => reject(err));
        });
    }));
}

async function formatServices(services) {
    return await Promise.all(services.map(service => {
        //? ...callingPointList.callingPoint sometimes doesn't exist.
        let callingPointsUnformatted = [];
        if (!service.subsequentCallingPoints || !service.subsequentCallingPoints.callingPointList || !service.subsequentCallingPoints.callingPointList.callingPoint)
            callingPointsUnformatted = [];
        else
            callingPointsUnformatted = service.subsequentCallingPoints.callingPointList.callingPoint;

        return formatCallingPoints(callingPointsUnformatted)
            .then((callingPoints) => {
                return new Promise(async (resolve, reject) => {
                    resolve(new Service(
                        service.serviceType,
                        service.serviceID,
                        service.rsid || '',
                        {
                            name: service.operator,
                            code: service.operatorCode,
                            homepageUrl: getOperatorHomepageUrl(service.operatorCode)
                        },
                        await Station.fromCrs(service.origin.location[0].crs),
                        await Station.fromCrs(service.destination.location[0].crs),
                        service.etd.toLowerCase() === "cancelled",
                        {
                            scheduled: service.std,
                            expected: getExpectedTime(service.std, service.etd),
                            onTime: isOnTime(service.std, service.etd)
                        },
                        callingPoints,
                        callingPoints.length === 1
                    ));
                });
            })
            .catch(err => console.error(err));
    }));
}

/*
    Hello world
*/
app.get('/', (req, res) => {
    res.send("departr API - try /train-station/details/CLJ - documentation coming soon");
});

//* Get details for provided CRS
app.get('/train-station/details/:crs', (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    Station.fromCrs(req.params.crs)
        .then(station => res.json(station))
        .catch(err => { res.status(500).json(err); console.error(err); });
});

//* Get services for provided CRS
app.get('/train-station/services/:crs', (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    if (!isStationCrsValid) {
        res.status(404).json({ message: "Station CRS does not exist" });
        return;
    }

    ldbwsAPI.getDepartureBoard(req.params.crs)
        .then(board => { return formatServices(board.trainServices.service); })
        .then(services => { res.json(services); })
        .catch(err => { res.status(500).json(err); console.error(err); });
});

// app.get('/train-station/station/next-departure/:crs', ...

app.get('/train-station/search/:crs', (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    searchTrainStations(req.params.crs)
        .then((data) => res.json(data))
        .catch((err) => { res.status(500).json(err); console.error(err); });
});
app.get('/find-stations/:type/:query', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if (req.params.type !== 'train') res.status(400).json('type must be "train"');
    findNearbyTrainStations(req.params.query)
        .then(stations => {
            res.json(stations.map(station => {
                return {
                    distanceMi: station.distanceMi,
                    ...station.data
                };
            }));
        })
        .catch((err) => { res.status(500).json(err); });
});

// Run app
app.listen(API_PORT, () => {
    console.log("\n\n\t>> API is running on port [" + API_PORT + "]");
});