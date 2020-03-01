import React from 'react';
import { Link } from 'react-router-dom';
import PT from 'prop-types';
import classnames from 'classnames';

import cn from './Service.module.scss';

function TimesPanel(props) {
    const {
        service
    } = props;

    if (service.time.onTime) { // On time
        return (
            <div className={cn.timesPanel}>
                <div className={classnames("labelUppercaseSmall", cn.timeLabel)}>On time</div>
                <div className={cn.time}>{service.time.expected}</div>
            </div>
        )
    }
    else if (service.cancelled) { // Cancelled
        return (
            <div className={cn.timesPanel + ' ' + cn.timesPanelCancelled}>
                <div className={classnames("labelUppercaseSmall", cn.timeLabel)}>Cancelled</div>
                <div className={cn.time}>{service.time.scheduled}</div>
            </div>
        )
    }
    else { // Delayed
        return (
            <div className={cn.timesPanel + ' ' + cn.timesPanelDelayed}>
                <div className={cn.time + ' ' + cn.timeDelayScheduled}>{service.time.scheduled}</div>
                <div className={classnames("labelUppercaseSmall", cn.timeLabel)}>expected</div>
                <div className={cn.time + ' ' + cn.timeDelayExpected}>{service.time.expected}</div>
            </div>
        )
    }
}

function BuyTickets(props) {
    return (
        <div className={cn.button + ' ' + cn.buttonBuyTickets}>
            <a href="https://google.com/">Buy Tickets</a>
        </div>
    )
}

function CallingPoint(props) {
    const point = props.data;

    return (
        <li className={cn.callingPointWrapper}>
            <span className={cn.callingPointTime}>{point.time.expected}</span>
            <span className={cn.callingPointLabel}>&nbsp;-&nbsp;</span>
            <span className={cn.callingPointStation}>
                <Link to={"/" + point.station.crs}>{point.station.name}</Link>
            </span>
        </li>
    )
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
                        <span className={classnames("labelUppercaseSmall", cn.labelTiny)}>From&nbsp;</span>
                        <Link to={service.stationOrigin.crs}>{service.stationOrigin.name}</Link>
                        <span className={classnames("labelUppercaseSmall", cn.labelTiny)}>&nbsp;to&nbsp;</span>
                        <Link to={service.stationDestination.crs}>{service.stationDestination.name}</Link>
                    </div>

                    <div className={classnames(cn.operatorPanel, cn.gridTopRight)}>
                        <a href={service.operator.homepageUrl} target="_blank" rel="noreferrer noopener">
                            <span><i className="material-icons">train</i></span>
                            <span className={classnames("labelUppercaseSmall", cn.operatorLabel)}>Operated by</span>
                            <span className={cn.operatorCode}>{service.operator.code}</span>
                            <span className={cn.operatorName}>{service.operator.name}</span>
                        </a>
                    </div>

                    <ol className={classnames(cn.callingPoints, cn.gridBottomMiddle)}>
                        {service.callingPoints.map((point, index) => {
                            return ( <CallingPoint key={index} data={point} /> )
                        })}
                    </ol>

                    { !service.cancelled && <BuyTickets service={service} className={cn.gridBottomLeft} /> }
                </div>
            </li>
        );
    }
}

//todo: PLEASE, for the love of god, REFACTOR THIS SOMEHOW
export let PTService = PT.exact({
    serviceType: PT.string.isRequired,
    serviceID: PT.string.isRequired,
    rsid: PT.string.isRequired,
    operator: PT.exact({
        name: PT.string.isRequired,
        code: PT.string.isRequired,
        homepageUrl: PT.string.isRequired
    }).isRequired,
    stationOrigin: PT.exact({
        name: PT.string.isRequired,
        crs: PT.string.isRequired
    }).isRequired,
    stationDestination: PT.exact({
        name: PT.string.isRequired,
        crs: PT.string.isRequired
    }).isRequired,
    cancelled: PT.bool.isRequired,
    time: PT.exact({
        scheduled: PT.string.isRequired,
        expected: PT.string.isRequired,
        onTime: PT.bool.isRequired
    }).isRequired,
    callingPoints: PT.arrayOf(PT.exact({
        station: PT.exact({
            name: PT.string.isRequired,
            crs: PT.string.isRequired
        }).isRequired,
        cancelled: PT.bool.isRequired,
        time: PT.exact({
            scheduled: PT.string.isRequired,
            expected: PT.string.isRequired,
            onTime: PT.bool.isRequired
        }).isRequired
    }).isRequired).isRequired,
    direct: PT.bool.isRequired
});

Service.propTypes = {
    service: PTService.isRequired
}

export default Service;