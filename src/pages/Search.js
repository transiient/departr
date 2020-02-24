import React from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';

import { searchStations } from '../redux/actions/searchActions';

import SearchResultsList from '../components/SearchResultsList';
import SearchBar from '../components/SearchBar';

import cn from './Search.module.scss';

class Search extends React.Component {
    componentDidMount() {
        if (this.props.match.params.query)
            this._runSearch(this.props.match.params.query);
    }
    componentDidUpdate(prevProps) {
        if (this.props.match.params.query !== prevProps.match.params.query)
            this._runSearch(this.props.match.params.query);
    }

    _runSearch(query) {
        console.log("_runSearch " + query);
        this.props.searchStations(query);
    }

    render() {
        const pageTitle = ("Search " + (this.props.query?this.props.query+' ':'') + "| departr");

        let { isLoading, query, results, error } = this.props;

        console.log(this.props.results);

        return (
            <div className={"page " + cn.pageContainer}>
                <Helmet>
                    <title>{ pageTitle }</title>
                </Helmet>

                { isLoading &&
                    <span>Loading results...</span> }

                { !isLoading && !query &&
                    <div className="noin">
                        No search input
                    </div> }

                { !isLoading && query && error &&
                    <div className={cn.errorContainer}>
                        Error loading results. See console.
                    </div>}

                { !isLoading && query && results.length === 0 &&
                    <div className={cn.noResultsContainer}>No results</div>}

                { !isLoading && query && results.length > 0 &&
                    <div className={cn.successContainer}>
                        <p className={cn.heading}>Search results for <span className={cn.query}>{ query }</span></p>
                        <SearchBar className={cn.searchBar} initialSearchQuery={ query } text />
                        <SearchResultsList className={cn.resultsList} items={ results || [] } />
                    </div>
                }
            </div>
        );
    }
}

const mapStateToProps = (store) => {
    return {
        isLoading: store.search.isLoading,
        query: store.search.query,
        results: store.search.results
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        searchStations: (query) => dispatch(searchStations(query))
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Search);