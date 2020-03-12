import React from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import classnames from 'classnames';

import Times from '../components/Times';

import { updateStationDetails, updateStationServices } from '../redux/actions/stationActions';

import cn from './ListDepartures.module.scss';

// todo: possibly find a nicer way to write this
function Banner(props) {
    return (
        <>
            { props.station.isLoading &&
            <div className={classnames(cn.banner, cn.bannerLoading)}>
                <h1>Loading...</h1>
            </div>}

            { !props.station.isLoading && !props.station.error &&
            <div className={cn.banner}>
                <Helmet><title>{ props.station.name + " departures | departr" }</title></Helmet>
                <h1>Departures from <span className="textColourPink textWeightBold">{props.station.name}</span></h1>
            </div>}
        </>
    )
}

class ListDepartures extends React.Component {
    componentDidMount() {
        const crs = this.props.match.params.crs;
        this.props.updateStationDetails(crs);
        this.props.updateStationServices(crs);
    } // componentDidMount()

    componentDidUpdate(prevProps) {
        if (prevProps.match.params.crs !== this.props.match.params.crs) {
            let crs = this.props.match.params.crs;

            this.props.updateStationDetails(crs);
            this.props.updateStationServices(crs);
        }
    }

    render() {
        const station = this.props.station;
        const services = this.props.services;

        // todo: error checking
        //!

        return (
            <div className={"page " + cn.pageContainer}>
                <div className={cn.wrapper}>
                    <Helmet>
                        <title>{ "Departures | departr" }</title>
                    </Helmet>

                    <Banner station={station} />

                    { (services.error || station.error) &&
                    <div>An error occurred. Check console.</div>}

                    { !services.isLoading && !services.error && services.services &&
                    <Times
                        classNames={cn.times}
                        services={ services.services }
                    /> }
                </div>
            </div>
        );
    }
}

const mapStateToProps = (store) => {
    return {
        station: {
            isLoading: store.station.station.isLoading,
            error: store.station.station.error,
            ...store.station.station.station
        },
        services: {
            isLoading: store.station.services.isLoading,
            error: store.station.services.error,
            services: store.station.services.services
        }
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        updateStationDetails: (crs) => dispatch(updateStationDetails(crs)),
        updateStationServices: (crs) => dispatch(updateStationServices(crs))
    }
}

export default connect(
    mapStateToProps,
    //actions // Regular ol' Redux
    mapDispatchToProps // Thunk
)(ListDepartures);