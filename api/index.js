require('dotenv').config();
const uniq = require('lodash/uniq');
const express = require('express')
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

// Classes
const KnowledgeBaseAPI = require('./upstreamRequestHelpers/KnowledgeBaseAPI');
const LdbwsAPI = require('./upstreamRequestHelpers/LdbwsAPI');

// Data
const StationCodes = require('../src/data/station_codes.json');
const TrainOperatingCompanies = require('../src/data/train_operating_companies.json');

const {
    API_PORT,
    LDBWS_TOKEN,
    ORD_USERNAME,
    ORD_PASSWORD,
    RELOAD_STATIONS_ON_RELOAD
} = process.env;

if (API_PORT === null || LDBWS_TOKEN === null || ORD_USERNAME === null || ORD_PASSWORD === null) {
    console.error("Required environment variable(s) not set");
    console.log("Please copy /example.env to /.env and insert the required environment variables.");
    console.log("   departr API cannot run without these variables set.");
}

const kbAPI = new KnowledgeBaseAPI(ORD_USERNAME, ORD_PASSWORD, RELOAD_STATIONS_ON_RELOAD);
const ldbwsAPI = new LdbwsAPI(LDBWS_TOKEN);

app.use(cors());
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function searchTrainStations(query, _data, _err) {
    let _matchCrs = (StationCodes.filter((station) => (station["CRS Code"]).toLowerCase() === query.toLowerCase()));
    let _similar = (StationCodes.filter((station) => ((station["CRS Code"]+station["Station Name"]).toLowerCase().includes(query.toLowerCase()))));

    for (let i = 0; i < _similar.length; i++)
        _matchCrs.push(_similar[i]);

    _matchCrs = uniq(_matchCrs);
    _data(_matchCrs.map((station) => ({ name: station["Station Name"], crs: station["CRS Code"]})));
}

//todo: save in database instead of local variable
let __popularStations__ = [];
function registerStationView(crs) {
    // todo: As array is sorted, this could use binary search
    for (let i = 0; i < __popularStations__.length; i++) {
        if (__popularStations__[i].crs === crs) {
            __popularStations__[i].hitCount += 1;
            return __popularStations__[i].hitCount;
        }
    }
    __popularStations__.push({crs, hitCount: 1});
    __popularStations__.sort((a, b) => (a.count - b.count));
}
function getPopularStations(limit = 5) {
    return (__popularStations__.slice(0, limit));
}
function getStationHitCount(crs) {
    // todo: As array is sorted, this could use binary search
    for (let i = 0; i < __popularStations__.length; i++) {
        if (__popularStations__[i].crs === crs)
            return __popularStations__[i].hitCount;
    }
    return 0;
}

function isOnTime(scheduled, expected) {
    if (expected.toLowerCase() === "on time") return true;
    if (expected === scheduled) return true;
    return false;
}
function getExpectedTime(scheduled, expected) {
    const onTime = (expected.toLowerCase() === "on time") || (expected === scheduled);
    const cancelled = (expected.toLowerCase() === "cancelled");
    const delayUnknown = (expected.toLowerCase() === "delayed");

    if (onTime) return scheduled;
    else if (cancelled) return scheduled;
    else if (delayUnknown) return "DELAY";
    else return expected;
}
// todo: update to use KB API
function getOperatorHomepageUrl(operatorCode) {
    const matchingToc = TrainOperatingCompanies.filter((operator) => operator.code === operatorCode);

    if (matchingToc.length > 0)
        return matchingToc[0].homepageUrl;
    return "";
}

function formatCallingPoint(callingPoint) {
    //? Apparently NRE sometimes returns "at" instead of "et"
    if (!callingPoint.et && callingPoint.at)
        callingPoint.et = callingPoint.at
    if (!callingPoint.et)
        callingPoint.et = ''

    let out = {
        station: {
            name: callingPoint.locationName || '',
            crs: callingPoint.crs || ''
        },
        cancelled: (callingPoint.et || '').toLowerCase() === "cancelled",
        time: {
            scheduled: callingPoint.st,
            expected: getExpectedTime(callingPoint.st, callingPoint.et),
            onTime: isOnTime(callingPoint.st, callingPoint.et)
        }
    }

    if (out.station.name === '' || out.station.crs === '')
        console.error('formatCallingPoint() station.name or station.crs empty -- callingPoint ->', callingPoint);

    return out;
}
function formatCallingPoints(callingPoint) {
    // NRE sometimes returns no calling points. Thanks again, NRE. Brilliant API.
    let callingPoints = [];

    if (!Array.isArray(callingPoint)) {
        // If not array, make it an array with single element. Thanks, NRE, once again.
        //? Direct trains only have single callingPoint, and it's an OBJECT. WHY???
        callingPoints = [callingPoint];
    } else {
        callingPoints = callingPoint;
    }

    return (callingPoints.map((point) => formatCallingPoint(point)));
}

function formatService(service) {
    let out = {
        serviceType: service.serviceType,
        serviceID: service.serviceID,
        rsid: service.rsid||'',
        operator: {
            name: service.operator,
            code: service.operatorCode,
            homepageUrl: getOperatorHomepageUrl(service.operatorCode)
        },
        stationOrigin: {
            name: service.origin.location[0].locationName,
            crs: service.origin.location[0].crs
        },
        stationDestination: {
            name: service.destination.location[0].locationName,
            crs: service.destination.location[0].crs
        },
        cancelled: service.etd.toLowerCase() === "cancelled",
        time: {
            scheduled: service.std,
            expected: getExpectedTime(service.std, service.etd),
            onTime: isOnTime(service.std, service.etd)
        },
        //! service.subsequentCallingPoints.callingPointList.callingPoint SOMETIMES DOESN'T EXIST
        // todo(urgent):
        // pass an empty array to formatCallingPoints if any of: subsequentCallingPoints, callingPointList, or callingPoint do not exist
        callingPoints: formatCallingPoints(service.subsequentCallingPoints.callingPointList.callingPoint || []),
        direct: false
    };

    //? If there are no actual calling oints, the final destination will be the only callingPoint
    out.direct = out.callingPoints.length === 1;

    return out;
}

function formatServices(services) {
    return services.map((service) => formatService(service));
}

function isStationCrsValid(crs) {
    return StationCodes.filter((station) => station.crs === crs);
}

/*
    Hello world
*/
app.get('/', (req, res) => {
    res.send("Hello");
});

/*
    Get popular stations, or hitCount of station if crs is provided
*/
// app.get('/train-station/popular/:crs?', (req, res) => {
//     console.log("popular stations -> " + req.params.crs);
//     res.setHeader('Content-Type', 'application/json');

//     if (req.params.crs) {
//         res.json(getStationHitCount(req.params.crs));
//     }
//     res.json(getPopularStations());
// });

app.get('/train-station/details/:crs', (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    if (!isStationCrsValid) {
        res.status(404).json({ message: "Station CRS does not exist" });
        return;
    }

    kbAPI.getStationDetails(req.params.crs)
    .then((details) => {
        res.json(details);
    })
    .catch((error) => {
        console.error(error);
        res.status(500).json(error);
    });
});

/*
    Get services for provided station crs
*/
app.get('/train-station/services/:crs', (req, res) => {
    registerStationView(req.params.crs);

    res.setHeader('Content-Type', 'application/json');

    if (!isStationCrsValid) {
        res.status(404).json({ message: "Station CRS does not exist" });
        return;
    }

    ldbwsAPI.getDepartureBoard(req.params.crs)
    .then((board) => {
        res.json(formatServices(board.trainServices.service));
    })
    .catch((error) => {
        console.error(error);
        res.status(500).json(error);
    })
});

// app.get('/train-station/station/next-departure/:crs', ...

app.get('/train-station/search/:crs', (req, res) => {
    console.log("search -> ", req.params.crs);

    res.setHeader('Content-Type', 'application/json');

    searchTrainStations(req.params.crs, (results) => res.json(results), (error) => res.json(error));
});

// Run app
app.listen(API_PORT, () => console.log("Running API on port " + API_PORT + "."));