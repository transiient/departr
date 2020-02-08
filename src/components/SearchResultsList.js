import React from 'react';

import SearchResult from './SearchResult';

class SearchResultsList extends React.Component {
    componentDidUpdate(prevProps) {
        // if(this.props !== prevProps) {
        //     let { query, results } = this.props;
        //     let _match = null;

        //     if (/^([a-zA-Z]{3})$/.test(query)) {
        //         _match = results.filter((it) => ((it["CRS Code"].toUpperCase()) === query.toUpperCase()))[0] || null;
        //         console.log("testing queryCrsStationDetail inside componentDidUpdate (query, _match)", query, _match);
        //     }

        //     this.setState({
        //         query: query,
        //         queryCrsStationDetail: _match,
        //         results: results
        //     });
        // }
    }

    // _prioritiseCrsIfSet() {
    //     let { queryCrsStationDetail } = this.props;

    //     if (!!queryCrsStationDetail) {
    //         return (
    //             <span>Are you looking for <a href={ "/" + queryCrsStationDetail["CRS Code"] }>{ queryCrsStationDetail["Station Name"] }</a>?</span>
    //         );
    //     }
    //     else {
    //         return (null);
    //     }
    // }

    _checkNoResults(items) {
        if (items?.length ?? 0 < 1)
            return (<span>No results</span>);
    }

    render() {
        let { items } = this.props;

        this._checkNoResults(items);

        return (
            <ol className={ "listbox " + this.props.className||'' }>{ items.map((it) => (
                <SearchResult key={ it['CRS Code'] } detail={ it } />
            )) /* results.map() */}</ol>
        );
    }
}

export default SearchResultsList;