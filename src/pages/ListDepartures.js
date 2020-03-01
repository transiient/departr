import React from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import classnames from 'classnames';

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

        const {
            isLoading,
            error,
            details
        } = this.props;

        if (error) console.error(error);

        return (
            <div className={"page " + cn.pageContainer}>
                { isLoading &&
                <div className={cn.loading}>
                    <Helmet>
                        <title>{ 'Loading | departr' }</title>
                    </Helmet>
                    Loading departures...
                </div> }

                { error && 
                <div className={cn.error}>
                    <Helmet>
                        <title>{ 'Error - departures | departr' }</title>
                    </Helmet>
                    Error: { error.message }
                </div> }

                { (!isLoading && !error) &&
                <div className={cn.wrapper}>
                    <Helmet>
                        <title>{ details.station.name + " departures | departr" }</title>
                    </Helmet>
                    <h1 className={cn.title}>
                        Departures from <span className={classnames("textColorPink", "textWeightBold")}>{ details.station.name }</span>
                    </h1>

                    <Times
                        classNames={cn.times}
                        services={ details.services }
                    />
                </div> }
            </div>
        );
    }
}

const mapStateToProps = (store) => {
    return {
        isLoading: store.station.isLoading,
        error: store.station.error,
        details: store.station.details
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