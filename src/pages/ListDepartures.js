import React from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';

import Times from '../components/Times';

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
        console.log(this.props);

        const pageTitle = (station.station.name + " departures | departr");

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
                <div className={cn.wrapper}>
                    <div className={cn.title}>
                        Departures from <span className={cn.pink}>{ station.station.name }</span>
                    </div>

                    <Times
                        services={ station.services }
                    />
                </div> }
            </div>
        );
    }
}

const mapStateToProps = (store) => {
    console.dir(store.station);
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