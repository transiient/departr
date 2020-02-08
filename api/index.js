const uniq = require('lodash/uniq');
const express = require('express')
const app = express();
const soap = require('soap');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

if (!process.env.API_TOKEN_TRAIN||!process.env.API_URL_TRAIN) {
    console.log("Please copy /example.env to /api/.env and insert required environment variables.");
    process.exit();
}
const API_URL_TRAIN      = process.env.API_URL_TRAIN;
const API_TOKEN_TRAIN    = process.env.API_TOKEN_TRAIN;
const EXPRESS_PORT = 3001;

const StationCodes = require('../src/data/station_codes.json');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function searchTrainStations(query, _data, _err) {
    const data = StationCodes;
    let _rv = [];
    let _match = (data.filter((it) => (it["CRS Code"]).toLowerCase() === query.toLowerCase()));
    let _additions = (data.filter((it) => ((it["CRS Code"]+it["Station Name"]).toLowerCase().includes(query.toLowerCase()))));

    for (let i = 0; i < _additions.length; i++)
        _match.push(_additions[i]);

    _rv = uniq(_match);

    _data(_rv);
    return;
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
        const _br = res[0].GetStationBoardResult;

        //! sometimes, services is blank. eg: cls: CLP
        // thanks, NRE.
        if (!_br.trainServices)
            _br.trainServices = {service: []};

        _data({
            stationCrs: _br.crs,
            stationName: _br.locationName,
            services: _br.trainServices.service
        });
    })
    .catch((err) => {
        _error(err);
    });
}

app.get('/', (req, res) => {
    res.send("Hello, you've hit the API!");
});

app.get('/station-detail/train/:stationCrs', (req, res) => {
    console.log("station-details -> " + req.params.stationCrs)
    // todo: error check to ensure station actually exists
    res.setHeader('Content-Type', 'application/json');
    getStationDetails(req.params.stationCrs, (data) => {console.log(data);res.json(data)}, (err) => {console.log(err);res.json(err)});
});

app.get('/station-next-departure/train/:stationCrs', (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    getStationDetails(req.params.stationCrs, (data) => {
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