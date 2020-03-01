require('dotenv').config();
const uniq = require('lodash/uniq');
const express = require('express')
const app = express();
const soap = require('soap');
const bodyParser = require('body-parser');
const cors = require('cors');

if (!process.env.API_TOKEN_TRAIN||!process.env.API_URL_TRAIN) {
    console.log("Please copy /example.env to /.env and insert required environment variables.");
    console.log("   Server might fail to connect if these variables remain unset");
    console.log("   If /.env already exists, try copying it to /api/.env");
}
const API_URL_TRAIN      = process.env.API_URL_TRAIN;
const API_TOKEN_TRAIN    = process.env.API_TOKEN_TRAIN;
const EXPRESS_PORT = 3001;

const StationCodes = require('../src/data/station_codes.json');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function searchTrainStations(query, _data, _err) {
    const data = StationCodes.map((station) => ({
        name: station["Station Name"],
        crs: station["CRS Code"]
    }));
    let _rv = [];
    let _match = (data.filter((station) => (station.crs).toLowerCase() === query.toLowerCase()));
    let _additions = (data.filter((station) => ((station.crs+station.name).toLowerCase().includes(query.toLowerCase()))));

    for (let i = 0; i < _additions.length; i++)
        _match.push(_additions[i]);

    _rv = uniq(_match);

    _data(_rv);
    return;
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
    console.log("isOnTime", scheduled, expected);
    if (expected.toLowerCase() === "on time") {
        console.log("on time");
        return true;
    }
    if (expected === scheduled) {
        console.log("match");
        return true;
    }
    return false;
}
function getExpectedTime(scheduled, expected) {
    const onTime = (expected.toLowerCase() === "on time") || (expected === scheduled);
    const cancelled = (expected.toLowerCase() === "cancelled");
    const delayUnknown = (expected.toLowerCase() === "delayed");

    if (onTime)
        return scheduled;
    else if (cancelled)
        return scheduled;
    else if (delayUnknown)
        return "DELAY";
    else
        return expected;
}
function formatCallingPoint(callingPoint) {
    let out = {
        station: {
            name: callingPoint.locationName || '',
            crs: callingPoint.crs || ''
        },
        cancelled: callingPoint.et.toLowerCase() === "cancelled",
        time: {
            scheduled: callingPoint.st,
            expected: getExpectedTime(callingPoint.st, callingPoint.et),
            onTime: isOnTime(callingPoint.st, callingPoint.et)
        }
    }

    if (out.station.name === '' || out.station.crs === '')
        console.error('formatCallingPoint() callingPoint ->', callingPoint);

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
            code: service.operatorCode
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
    return (services.map((service) => formatService(service)));
}

function isStationCrsValid(crs) {
    return StationCodes.filter((station) => station.crs === crs);
}

function getStationDetails(queryCrs, _data, _error) {
    const soapHeader = { "tok:AccessToken": { "tok:TokenValue": API_TOKEN_TRAIN } };

    const wsdlOptions = {
        "overrideRootElement": {
            "namespace": "mns",
            "xmlnsAttributes": [{ "name": "xmlns:mns", "value": "http://thalesgroup.com/RTTI/2017-10-01/ldb/" }]
        }
    }
    const args = {
        "mns:numRows": 10, // Number of services to return. [1 - 10]
        "mns:crs": queryCrs, // CRS of queried station.
        "mns:filterCrs": '', // Filter by origin or destination.
        "mns:filterType": 'to', // Filter type. Origin ("from") or destination ("to").
        "mns:timeOffset": 0, // Offset against current time. [-120 - 120]
        "mns:timeWindow": 120 // How far to provide times for in minutes [-120 - 120]
    }

    soap.createClientAsync(API_URL_TRAIN, wsdlOptions)
    .then((client) => {
        client.addSoapHeader(soapHeader, '', 'tok'); // (header, name (does nothing), namespace)
        return (client.GetDepBoardWithDetailsAsync(args));
    })
    .then((res) => {
        // Deal with the request's result
        const _boardResult = res[0].GetStationBoardResult;

        //? sometimes, services is blank. eg: cls: CLP
        // thanks, NRE.
        if (!_boardResult.trainServices)
            _boardResult.trainServices = {service: []};

        const _services = formatServices(_boardResult.trainServices.service);
        if (!_services) {
            // todo: make nicer
            throw new Error('Board Result data invalid');
        }

        _data({
            station: {
                name: _boardResult.locationName,
                crs: _boardResult.crs,
                hitCount: getStationHitCount(_boardResult.crs)
            },
            services: _services
        });
    })
    .catch((err) => {
        console.error("Error in getStationDetails: ", err);
        _error(err);
    });
}

app.get('/', (req, res) => {
    res.send("Hello, you've hit the API!");
});

app.get('/station-detail/popular/:crs?', (req, res) => {
    console.log("popular stations -> " + req.params.crs);
    res.setHeader('Content-Type', 'application/json');

    if (req.params.crs) {
        res.json(getStationHitCount(req.params.crs));
    }
    res.json(getPopularStations());
});

app.get('/station-detail/train/:crs', (req, res) => {
    console.log("station-details -> " + req.params.crs);

    registerStationView(req.params.crs);

    res.setHeader('Content-Type', 'application/json');

    if (isStationCrsValid(req.params.crs)) {
        getStationDetails(req.params.crs, (data) => res.json(data), (err) => { console.log(err); res.json(err); });
    }
    else {
        res.status(404).json({
            message: "Station CRS does not exist"
        });
    }
});

app.get('/station-next-departure/train/:crs', (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    getStationDetails(req.params.crs, (data) => {
        let _departure = data.GetStationBoardResult.trainServices.service[0];
        res.json(_departure)
    }, (err) => res.json(err));
});

app.get('/station-search/:method/:query?', (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    if (!req.params.query) {
        res.status(400).json({error: 'Missing query parameter'});
        return;
    }

    switch(req.params.method) {
        case 'train':
            searchTrainStations(req.params.query, (data) => res.json(data), (err) => res.json(err));
            break;
        case 'bike':
            res.status(501).json({error: 'This service is not yet implemented.'});
            break;
        case 'bus':
            res.status(501).json({error: 'This service is not yet implemented.'});
            break;
        default:
            res.status(400).json({error: 'Invalid method parameter value'});
            break;
    }
});

app.listen(EXPRESS_PORT, () => console.log("Running API on port " + EXPRESS_PORT + "."));