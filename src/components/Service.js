import React from 'react';
import { Link } from 'react-router-dom';

class Service extends React.Component {
    _getActualTime(scheduled, expected) {
        if (scheduled === "Cancelled") {
            return "Cancelled"
        }
        else if (scheduled === "Delayed") {
            return expected
        }
        else {
            return scheduled
        }
    }

    _deconstructService(service) {
        let nService = {
            serviceID: service.serviceID,
            operator: service.operator,
            origin: {
                stationName: service.origin.location[0].locationName,
                crs: service.origin.location[0].crs
            },
            destination: {
                stationName: service.destination.location[0].locationName,
                crs: service.destination.location[0].crs
            },
            time: {
                cancelled: service.etd==="Cancelled",
                scheduled: service.std,
                expected: service.etd,
                actual: this._getActualTime(service.std, service.etd)
            },
            direct: true,
            callingPoints: [] // Added below
        }

        let callingPoints = service.subsequentCallingPoints.callingPointList.callingPoint;
        if (Array.isArray(callingPoints)) {
            nService.direct = false;

            for (let i = 0; i < callingPoints.length; i++) {
                let point = callingPoints[i];

                nService.callingPoints.push({
                    stationName: point.locationName,
                    crs: point.crs,
                    time: {
                        cancelled: point.et==="Cancelled",
                        scheduled: point.st,
                        expected: point.et,
                        actual: this._getActualTime(point.st, point.et)
                    }
                });
            }
        }

        return(nService);
    }

    render() {
        let index = this.props.index;
        let service = this._deconstructService(this.props.service);

        return (
            <li key={ index } className="service">
                <div className="serviceInfo">
                    <div className="info">
                        { service.time.actual }
                        <span className="label"> to </span>
                        <span className="location">{ service.destination.stationName }</span>
                    </div>
                    <div className="origin">
                        <span className="label">Operated by { service.operator }, this train originally departed from </span>
                        <span className="location">{ service.origin.stationName }</span>
                    </div>
                </div>

                <div className="callingPoints">
                    { service.direct && // If service is direct
                        <span className="direct">Direct</span>
                    }
                    { !service.direct && // If service has additional stops
                    <ol className="callingPointList">
                        {
                            service.callingPoints.map((point, index) =>
                                <li key={ index } className="point">
                                    <Link to={ ('/' + point.crs) }>
                                        <span className="location">{ point.stationName }</span>
                                    </Link>
                                    <span className="label"> at </span>
                                    <span className="departureTime">{ point.time.actual }</span>
                                </li>
                            )
                        }
                    </ol>}
                </div>
            </li>
        );
    }
}

export default Service;