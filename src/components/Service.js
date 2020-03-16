import React from 'react';
import { Link } from 'react-router-dom';
import { PTService } from '../types/Service';
import classnames from 'classnames';
import { Map, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';

import cn from './Service.module.scss';

function TimesPanel(props) {
    const {
        service
    } = props;

    if (service.time.onTime) { // On time
        return (
            <div className={cn.timesPanel}>
                <div className={classnames("labelUppercaseSmall", cn.timeLabel)}>On time</div>
                <div className={classnames("textLarge", cn.time)}>{service.time.expected}</div>
            </div>
        );
    }
    else if (service.cancelled) { // Cancelled
        return (
            <div className={cn.timesPanel + ' ' + cn.timesPanelCancelled}>
                <div className={classnames("labelUppercaseSmall", cn.timeLabel)}>Cancelled</div>
                <div className={classnames("textLarge", cn.time)}>{service.time.scheduled}</div>
            </div>
        );
    }
    else { // Delayed
        return (
            <div className={cn.timesPanel + ' ' + cn.timesPanelDelayed}>
                <div className={classnames("textLarge", cn.time, cn.timeDelayScheduled)}>{service.time.scheduled}</div>
                <div className={classnames("labelUppercaseSmall", cn.timeLabel)}>expected</div>
                <div className={classnames("textLarge", cn.time, cn.timeDelayExpected)}>{service.time.expected}</div>
            </div>
        );
    }
}

function ButtonJourneyMap(props) {
    return (
        <div className={cn.button + ' ' + cn.buttonJourneyMap}>
            {!props.showJourneyMap &&
                <button onClick={props.handleClick}>Show Journey Map</button>}
            {props.showJourneyMap &&
                <button onClick={props.handleClick}>Show Stops</button>}
        </div>
    );
}

function CallingPoint(props) {
    const point = props.data;

    return (
        <li className={cn.callingPointWrapper}>
            <span className={classnames("textLarge", cn.callingPointTime)}>{point.time.expected}</span>
            <span className={cn.callingPointStation}>
                <Link to={"/train/" + point.station.crs}>{point.station.name}</Link>
            </span>
        </li>
    );
}

function JourneyMap(props) {
    // todo: pass down current station and use those values for default
    const mapDefaultPosition = [
        parseFloat(props.stationOrigin.location.latitude),
        parseFloat(props.stationOrigin.location.longitude)
    ];
    const newCallingPoints = props.callingPoints.slice();
    newCallingPoints.unshift({ station: props.stationOrigin });
    newCallingPoints.push({ station: props.stationDestination });
    const mapPolylinePositions = newCallingPoints.map((callingPoint) => {
        return [
            parseFloat(callingPoint.station.location.latitude),
            parseFloat(callingPoint.station.location.longitude)
        ];
    });

    // todo(ts migration): ignore center, position errors until migrated to typescript
    return (
        <Map center={mapDefaultPosition} zoom={10} className={cn.journeyMap}>
            <TileLayer
                attribution='&amp;copy <a href="http://osm.org/copyright">OSM</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={mapDefaultPosition}>
                <Popup>
                    {props.stationOrigin.name}
                </Popup>
            </Marker>
            <Polyline positions={mapPolylinePositions} />
        </Map>
    );
}

class Service extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showJourneyMap: false
        };

        this.handleShowJourneyMapClick = this.handleShowJourneyMapClick.bind(this);
    }

    handleShowJourneyMapClick(e) {
        this.setState({ showJourneyMap: !this.state.showJourneyMap });
    }

    render() {
        let {
            service
        } = this.props;

        return (
            <li className={cn.wrapper + ' ' + (this.props.service.cancelled ? cn.cancelled : '')}>
                <div className={cn.backgroundTextHuge}>{service.stationDestination.name}</div>

                <div className={cn.container}>
                    <TimesPanel service={service} className={cn.gridTopLeft} />

                    <div className={classnames(cn.fromTo, cn.gridTopMiddle)}>
                        <span className={classnames("labelUppercaseSmall", cn.labelTiny, cn.fromToTo)}>To</span>
                        <Link className={classnames(cn.destination)} to={"/train/" + service.stationDestination.crs}>{service.stationDestination.name}</Link>
                        <span className={classnames("labelUppercaseSmall", cn.labelTiny, cn.fromToFrom)}>from</span>
                        <Link className={classnames(cn.origin)} to={"/train/" + service.stationOrigin.crs}>{service.stationOrigin.name}</Link>
                    </div>

                    <div className={classnames(cn.operatorPanel, cn.gridTopRight)}>
                        <a href={service.operator.homepageUrl} target="_blank" rel="noreferrer noopener">
                            <span className={cn.operatorType}><i className="material-icons">train</i></span>
                            <span className={classnames("labelUppercaseSmall", cn.operatorLabel)}>Operated by</span>
                            <span className={cn.operatorCode}>{service.operator.code}</span>
                            <span className={cn.operatorName}>{service.operator.name}</span>
                        </a>
                    </div>

                    {!this.state.showJourneyMap &&
                        <ol className={classnames(cn.callingPoints, cn.gridBottomMiddle)}>
                            {service.callingPoints.map((point, index) => {
                                return (<CallingPoint key={index} data={point} />);
                            })}
                        </ol>}

                    {!service.cancelled &&
                        <ButtonJourneyMap
                            handleClick={this.handleShowJourneyMapClick}
                            service={service}
                            showJourneyMap={this.state.showJourneyMap}
                            className={cn.gridBottomLeft} />}

                    {this.state.showJourneyMap &&
                        <div className={classnames(cn.journeyMapContainer, cn.gridBottomMiddle)}>
                            <JourneyMap
                                stationOrigin={service.stationOrigin}
                                stationDestination={service.stationDestination}
                                callingPoints={service.callingPoints} />
                        </div>}
                </div>
            </li>
        );
    }
}

//todo: PLEASE, for the love of god, REFACTOR THIS SOMEHOW

Service.propTypes = {
    service: PTService.isRequired
};

export default Service;