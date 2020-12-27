import { createClientAsync as createSoapClient } from "soap";

// URL from: https://lite.realtime.nationalrail.co.uk/openldbws/
//? Remain on this URL until a refactor - departr works based on this schema
const LDBWS_URL = "https://lite.realtime.nationalrail.co.uk/OpenLDBWS/wsdl.aspx?ver=2017-10-01";
const TrainOperatingCompanies = require("../data/train_operating_companies.json");

/* ********** */
/*   Getters  */
/* ********** */
//* Get the train operator's website URL
function getOperatorHomepageUrl(operatorCode) {
    const matchingToc = TrainOperatingCompanies.filter(
        (operator) => operator.code === operatorCode
    );

    // todo: update to use KB API
    if (matchingToc.length > 0) return matchingToc[0].homepageUrl;
    return "";
}

/* ********** */
/*  Checkers  */
/* ********** */
//* Check if the train is running on time
function isOnTime(scheduled, expected) {
    //? NRE could return various values for the expected time.
    if (expected.toLowerCase() === "on time") return true;
    if (expected === scheduled) return true;
    return false;
}
//* Get the true expected time of the train, whether on time or not
function getExpectedTime(scheduled, expected) {
    const onTime = expected.toLowerCase() === "on time" || expected === scheduled;
    const cancelled = expected.toLowerCase() === "cancelled";
    const delayUnknown = expected.toLowerCase() === "delayed";

    if (onTime) return scheduled;
    else if (cancelled) return scheduled;
    else if (delayUnknown) return "DELAY";
    else return expected;
}

// Static formatters/fixers/other things
function ensureArray(input) {
    if (!Array.isArray(input)) return [input];
    else return input;
}

/* ********** */
/* Formatters */
/* ********** */
async function formatCallingPoint(callingPoint) {
    try {
        const expectedTime = callingPoint.at || callingPoint.et || "";
        const station = await RailStation.fromCrs(callingPoint.crs);

        return new CallingPoint(station, expectedTime.toLowerCase() === "cancelled", {
            scheduled: callingPoint.st,
            expected: getExpectedTime(callingPoint.st, expectedTime),
            onTime: isOnTime(callingPoint.st, expectedTime),
        });
    } catch (err) {
        throw err;
    }
}

//* Format a single departure (service)
async function formatService(service) {
    try {
        if (service.subsequentCallingPoints?.callingPointList?.callingPoint) {
            let callingPoints =
                service.subsequentCallingPoints?.callingPointList?.callingPoint || [];
            delete service.subsequentCallingPoints;

            //? If callingPoint is object (it happens, thanks NRE), make array
            callingPoints = ensureArray(callingPoints);

            //? Format calling points
            callingPoints = await Promise.all(
                callingPoints.map(async (callingPoint) => formatCallingPoint(callingPoint))
            );

            //? Remove duplicate origin station (if necessary)
            callingPoints.filter((callingPoint) => {
                if (callingPoint.station.crs !== service.origin.location[0].crs) {
                    return true;
                }
                return false;
            });

            service.callingPoints = callingPoints;
        } else {
            service.callingPoints = [];
        }

        const stationOrigin = await RailStation.fromCrs(service.origin.location[0].crs);
        const stationDestination = await RailStation.fromCrs(service.destination.location[0].crs);
        const operatorHomepageUrl = getOperatorHomepageUrl(service.operatorCode);
        const expectedTime = getExpectedTime(service.std, service.etd);
        const onTime = isOnTime(service.std, service.etd);

        return new Service(
            service.serviceType,
            service.serviceID,
            service.rsid || "",
            {
                name: service.operator,
                code: service.operatorCode,
                homepageUrl: operatorHomepageUrl,
            },
            stationOrigin,
            stationDestination,
            service.etd.toLowerCase() === "cancelled",
            {
                scheduled: service.std,
                expected: expectedTime,
                onTime: onTime,
            },
            service.callingPoints,
            service.callingPoints.length === 0
        );
    } catch (err) {
        throw err;
    }
}

export default class LdbwsAPI {
    constructor(token) {
        this.authCredentials = {
            token: token,
        };
    }

    async getDepartures(crs) {
        const soapHeader = { "tok:AccessToken": { "tok:TokenValue": this.authCredentials.token } };

        const wsdlOptions = {
            overrideRootElement: {
                namespace: "mns",
                xmlnsAttributes: [
                    { name: "xmlns:mns", value: "http://thalesgroup.com/RTTI/2017-10-01/ldb/" },
                ],
            },
        };
        const args = {
            "mns:numRows": 10, // Number of services to return. [1 - 10]
            "mns:crs": crs, // CRS of queried station.
            "mns:filterCrs": "", // Filter by origin or destination.
            "mns:filterType": "to", // Filter type. Origin ("from") or destination ("to").
            "mns:timeOffset": 0, // Offset against current time. [-120 - 120]
            "mns:timeWindow": 120, // How far to provide times for in minutes [-120 - 120]
        };

        try {
            const soapClient = await createSoapClient(LDBWS_URL, wsdlOptions);
            soapClient.addSoapHeader(soapHeader, "", "tok"); // (header, name (does nothing), namespace)
            const departureBoardResponse = await soapClient.GetDepBoardWithDetailsAsync(args);
            const departureBoard = departureBoardResponse[0];

            //? Services array sometimes doesn't exist, so set it strictly here
            let services;
            if (
                !departureBoard.GetStationBoardResult.trainServices ||
                !departureBoard.GetStationBoardResult.trainServices.service
            ) {
                services = [];
            } else {
                services = departureBoard.GetStationBoardResult.trainServices.service;
            }

            return Promise.all(
                services.map(async (service) => {
                    return await formatService(service);
                })
            );
        } catch (err) {
            throw err;
        }
    }
}
