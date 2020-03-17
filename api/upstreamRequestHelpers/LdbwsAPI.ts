import { createClientAsync as createSoapClient } from 'soap';

// URL from: https://lite.realtime.nationalrail.co.uk/openldbws/
//? Remain on this URL until a refactor - departr works based on this schema
const LDBWS_URL: string = 'https://lite.realtime.nationalrail.co.uk/OpenLDBWS/wsdl.aspx?ver=2017-10-01';

class LdbwsAPI {
    authCredentials: {
        token: string
    };

    constructor(token: string) {
        this.authCredentials = {
            token: token
        };
    }

    async getDepartures(crs: string) {
        const soapHeader = { "tok:AccessToken": { "tok:TokenValue": this.authCredentials.token } };

        const wsdlOptions = {
            "overrideRootElement": {
                "namespace": "mns",
                "xmlnsAttributes": [{ "name": "xmlns:mns", "value": "http://thalesgroup.com/RTTI/2017-10-01/ldb/" }]
            }
        };
        const args = {
            "mns:numRows": 10, // Number of services to return. [1 - 10]
            "mns:crs": crs, // CRS of queried station.
            "mns:filterCrs": '', // Filter by origin or destination.
            "mns:filterType": 'to', // Filter type. Origin ("from") or destination ("to").
            "mns:timeOffset": 0, // Offset against current time. [-120 - 120]
            "mns:timeWindow": 120 // How far to provide times for in minutes [-120 - 120]
        };

        //todo: tidy stationboardresult in this file
        try {
            const soapClient = await createSoapClient(LDBWS_URL, wsdlOptions)
            soapClient.addSoapHeader(soapHeader, '', 'tok'); // (header, name (does nothing), namespace)
            const departureBoard = await soapClient.GetDepBoardWithDetailsAsync(args);

            //? sometimes, services doesn't actually exist! For example, try cls: CLP
            let services = { service: [] };
            if (!departureBoard[0].GetStationBoardResult.trainServices) {
                services = { service: [] };
            } else {
                services = departureBoard[0].GetStationBoardResult.trainServices;
            }

            return services.service;
        } catch (err) {
            throw (err);
        }
    }
}

module.exports = LdbwsAPI;