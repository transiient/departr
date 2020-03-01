import React, { Component } from 'react';
import PT from 'prop-types';
import { Link } from 'react-router-dom';

import cn from './SearchResult.module.scss';

//todo: convert to rfc
class SearchResult extends Component {
    render() {
        const it = this.props.detail;

        return (
            <li className={cn.result}>
                <Link className={cn.station} to={ "/" + it["CRS Code"] } >
                    <div className={cn.badge}>
                        <span className={cn.mode}><i className="material-icons">train</i></span>
                        <span className={cn.crs}>{ it["CRS Code"] }</span>
                    </div>

                    <div className={cn.name}>{ it["Station Name"] }</div>
                </Link>

                <div className={cn.buttons}>
                    <a className={cn.button}
                        target="_blank" rel="noopener noreferrer"
                        href={ "https://www.google.com/maps/search/" + it["Station Name"] + " station" }>
                        <i className="material-icons">map</i>
                        <span className={cn.buttonLabel}>Location</span>
                    </a>
                    <Link className={cn.button}
                        to={ "/search/bus/" + it["Station Name"] }>
                        <i className="material-icons">directions_bus</i>
                        <span className={cn.buttonLabel}>Buses</span>
                    </Link>
                    <Link className={cn.button}
                        to={ "/search/bike/" + it["Station Name"] }>
                        <i className="material-icons">directions_bike</i>
                        <span className={cn.buttonLabel}>Bikes</span>
                    </Link>
                </div>
            </li>
        )
    }
}

export let PTSearchResult = PT.exact({
    "CRS Code": PT.string.isRequired,
    "Station Name": PT.string.isRequired
});
SearchResult.propTypes = {
    detail: PT.arrayOf(PTSearchResult.isRequired).isRequired
}

export default SearchResult;