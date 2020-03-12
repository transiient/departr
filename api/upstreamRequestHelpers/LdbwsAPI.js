const axios = require('axios').default;
const soap = require('soap');

// Latest URL from: https://lite.realtime.nationalrail.co.uk/openldbws/
const LDBWS_URL = 'https://lite.realtime.nationalrail.co.uk/OpenLDBWS/wsdl.aspx?ver=2017-10-01';

class LdbwsAPI {
    constructor(token) {
        this.authCredentials = {
            token: token
        }
    }

    getDepartureBoard(crs) {
        const soapHeader = { "tok:AccessToken": { "tok:TokenValue": this.authCredentials.token } };
    
        const wsdlOptions = { "overrideRootElement": {
            "namespace": "mns",
            "xmlnsAttributes": [{ "name": "xmlns:mns", "value": "http://thalesgroup.com/RTTI/2017-10-01/ldb/" }]
        } };
        const args = {
            "mns:numRows": 10, // Number of services to return. [1 - 10]
            "mns:crs": crs, // CRS of queried station.
            "mns:filterCrs": '', // Filter by origin or destination.
            "mns:filterType": 'to', // Filter type. Origin ("from") or destination ("to").
            "mns:timeOffset": 0, // Offset against current time. [-120 - 120]
            "mns:timeWindow": 120 // How far to provide times for in minutes [-120 - 120]
        };
    
        return soap.createClientAsync(LDBWS_URL, wsdlOptions)
        .then((client) => {
            client.addSoapHeader(soapHeader, '', 'tok'); // (header, name (does nothing), namespace)
            return client.GetDepBoardWithDetailsAsync(args);
        })
        .then((result) => {
            const departureBoard = result[0].GetStationBoardResult;
    
            //? sometimes, services doesn't actually exist! For example, try cls: CLP
            if (!departureBoard.trainServices)
                departureBoard.trainServices = { service: [] };
    
            return departureBoard;
        })
        // todo: error handling 
        .catch((error) => console.error(error));
    }
}

module.exports = LdbwsAPI;