import React from 'react';
import PT from 'prop-types'

import SearchResult from './SearchResult';
import { PTSearchResult } from './SearchResult';

class SearchResultsList extends React.Component {
    //todo: tidy
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

SearchResultsList.propTypes = {
    items: PT.arrayOf(PTSearchResult.isRequired)
}

export default SearchResultsList;