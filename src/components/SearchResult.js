import React, { Component } from 'react';
import PT from 'prop-types';
import { Link } from 'react-router-dom';

import cn from './SearchResult.module.scss';

//todo: convert to rfc
class SearchResult extends Component {
    render() {
        const station = this.props.detail;

        return (
            <li className={cn.result}>
                <Link className={cn.station} to={ "/" + station.crs } >
                    <div className={cn.badge}>
                        <span className={cn.mode}><i className="material-icons">train</i></span>
                        <span className={cn.crs}>{ station.crs }</span>
                    </div>

                    <div className={cn.name}>{ station.name }</div>
                </Link>

                <div className={cn.buttons}>
                    <a className={cn.button}
                        target="_blank" rel="noopener noreferrer"
                        href={ "https://www.google.com/maps/search/" + station.name + " station" }>
                        <i className="material-icons">map</i>
                        <span className={cn.buttonLabel}>Map</span>
                    </a>
                    <Link className={cn.button}
                        to={ "/search/bus/" + station.name }>
                        <i className="material-icons">directions_bus</i>
                        <span className={cn.buttonLabel}>Bus</span>
                    </Link>
                    {/*<Link className={cn.button}
                        to={ "/search/bike/" + station.name }>
                        <i className="material-icons">directions_bike</i>
                        <span className={cn.buttonLabel}>Bikes</span>
                    </Link>*/}
                </div>
            </li>
        )
    }
}

export let PTSearchResult = PT.exact({
    name: PT.string.isRequired,
    crs: PT.string.isRequired
});
SearchResult.propTypes = {
    detail: PTSearchResult.isRequired
}

export default SearchResult;