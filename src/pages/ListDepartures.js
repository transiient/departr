import React from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';

import TimesDisplay from '../components/TimesDisplay';

import { updateStationDetails } from '../redux/actions/stationActions';

import cn from './ListDepartures.module.scss';

class ListDepartures extends React.Component {
    constructor(props) {
        super(props);

        this._shouldComponentRender = this._shouldComponentRender.bind(this);
    }
    componentDidMount() {
        this.props.updateStationDetails(this.props.match.params.stationCrs);
    } // componentDidMount()

    componentDidUpdate(prevProps) {
        if (prevProps.match.params.stationCrs !== this.props.match.params.stationCrs) {
            let newCrs = this.props.match.params.stationCrs;

            this.props.updateStationDetails(newCrs);
        }
    }

    _shouldComponentRender(isLoading) {
        if (isLoading === false)
            return true;
        return false;
    }

    _getExpectedTime(callingPoint) {
        if (callingPoint.et === "On time")
            return (<span className="">{ callingPoint.st }</span>);
        else
            return (<span className="special">{ callingPoint.et }</span>);
    }

    render() {
        if (!this._shouldComponentRender(this.props.isLoading)) return <div>Loading</div>

        if (this.props.error) {
            // todo: probably put 404 redirect here
            console.error(this.props.error);
            return (<div>Error</div>);
        }

        const {
            isLoading,
            error,
            station
        } = this.props;
        const {
            stationCrs,
            stationName,
            services
        } = station || {};

        const pageTitle = (stationName + " Departures | departr");

        console.dir(this.props);

        return (
            <div className={"page " + cn.pageContainer}>
                <Helmet>
                    <title>{ pageTitle }</title>
                </Helmet>

                { isLoading &&
                <div className={cn.loading}>
                    Loading departures...
                </div> }

                { error && 
                <div className={cn.error}>
                    Error. See console.
                </div> }

                { !isLoading &&
                <div className="departuresLabel">
                    <span className="label">Showing departures from </span>
                    <span className="location">
                        { stationName } ({ stationCrs })
                    </span>
                    <a className="mapsLink"
                        target="_blank"
                        rel="noopener noreferrer"
                        href={ "https://www.google.com/maps/search/" + stationName + " station" }>
                        <span><i className="material-icons">map</i></span>
                    </a>
                </div> }
                { /* todo: only show when near cities
                    show a short list of nearby bike stops with a link to see more?
                <Link className="bikesLink"
                    target="_blank" rel="noopener noreferrer"
                    to={ "/bike/search/" + stationName }>
                    <span>More bikes near here</span>
                </Link>*/ }

                <TimesDisplay
                    stationCrs={ stationCrs }
                    stationName={ stationName }
                    services={ services }
                />
            </div>
        );
    }
}

const mapStateToProps = (store) => {
    return {
        isLoading: store.station.isLoading,
        error: store.station.error,
        station: store.station.station
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        updateStationDetails: (crs) => dispatch(updateStationDetails(crs))
    }
}

export default connect(
    mapStateToProps,
    //actions // Regular ol' Redux
    mapDispatchToProps // Thunk
)(ListDepartures);