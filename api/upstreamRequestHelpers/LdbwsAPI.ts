import { createClientAsync as createSoapClient } from 'soap';

// URL from: https://lite.realtime.nationalrail.co.uk/openldbws/
//? Remain on this URL until a refactor - departr works based on this schema
const LDBWS_URL: string = 'https://lite.realtime.nationalrail.co.uk/OpenLDBWS/wsdl.aspx?ver=2017-10-01';

interface Service { [key: string]: any };

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
            const departureBoardResponse = await soapClient.GetDepBoardWithDetailsAsync(args);
            const departureBoard = departureBoardResponse[0];

            //? services array sometimes doesn't exist
            let services: Service[];
            if (!departureBoard.GetStationBoardResult.trainServices || !departureBoard.GetStationBoardResult.trainServices.service) {
                services = [];
            } else {
                services = departureBoard.GetStationBoardResult.trainServices.service;
            }

            //? calling points array sometimes doesn't exist
            const formattedServices = await services.map((service) => {
                let callingPointsUnformatted = [];
                if (!service.subsequentCallingPoints || !service.subsequentCallingPoints.callingPointList || !service.subsequentCallingPoints.callingPointList.callingPoint) {
                    callingPointsUnformatted = [];
                    try {
                        delete service.subsequentCallingPoints;
                    } catch (err) { }
                } else {
                    callingPointsUnformatted = service.subsequentCallingPoints.callingPointList.callingPoint;
                    //? Sometimes, NRE API will return a single object instead of an array of objects
                    if (!Array.isArray(callingPointsUnformatted))
                        callingPointsUnformatted = [callingPointsUnformatted];
                    delete service.subsequentCallingPoints;
                }

                service.callingPoints = callingPointsUnformatted;
                // todo: format service/cp in here
                return service;
            });

            return formattedServices;
        } catch (err) {
            throw (err);
        }
    }
}

module.exports = LdbwsAPI;