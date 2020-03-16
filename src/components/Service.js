import React from 'react';
import { Link } from 'react-router-dom';
import { PTService } from '../types/Service';
import classnames from 'classnames';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';

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
            <button onClick={props.showJourneyMap}>See Journey Map</button>
        </div>
    );
}

function CallingPoint(props) {
    const point = props.data;

    return (
        <li className={cn.callingPointWrapper}>
            <span className={classnames("textLarge", cn.callingPointTime)}>{point.time.expected}</span>
            <span className={cn.callingPointStation}>
                <Link to={"/" + point.station.crs}>{point.station.name}</Link>
            </span>
        </li>
    );
}

function JourneyMap(props) {
    const position = [props.stationOrigin.location.latitude, props.stationOrigin.location.longitude];

    return (
        <Map center={position} zoom={10}>
            <TileLayer
                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
                <Popup>
                    {props.stationOrigin.name}
                </Popup>
            </Marker>
        </Map>
    );
}

class Service extends React.Component {
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
                        <Link className={classnames(cn.destination)} to={service.stationDestination.crs}>{service.stationDestination.name}</Link>
                        <span className={classnames("labelUppercaseSmall", cn.labelTiny, cn.fromToFrom)}>from</span>
                        <Link className={classnames(cn.origin)} to={service.stationOrigin.crs}>{service.stationOrigin.name}</Link>
                    </div>

                    <div className={classnames(cn.operatorPanel, cn.gridTopRight)}>
                        <a href={service.operator.homepageUrl} target="_blank" rel="noreferrer noopener">
                            <span className={cn.operatorType}><i className="material-icons">train</i></span>
                            <span className={classnames("labelUppercaseSmall", cn.operatorLabel)}>Operated by</span>
                            <span className={cn.operatorCode}>{service.operator.code}</span>
                            <span className={cn.operatorName}>{service.operator.name}</span>
                        </a>
                    </div>

                    <ol className={classnames(cn.callingPoints, cn.gridBottomMiddle)}>
                        {service.callingPoints.map((point, index) => {
                            return (<CallingPoint key={index} data={point} />);
                        })}
                    </ol>

                    {!service.cancelled && <ButtonJourneyMap service={service} className={cn.gridBottomLeft} />}

                    <JourneyMap stationOrigin={service.stationOrigin} stationDestination={service.stationDestination} />
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