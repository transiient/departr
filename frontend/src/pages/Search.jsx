import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet";
import { useSelector, useDispatch } from "react-redux";

import { searchStations } from "../redux/actions/searchActions";

import SearchResults from "../components/SearchResults";

const Search = ({ query }) => {
    const { isLoading, error, results } = useSelector((state) => state.search);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(searchStations(query));
    }, [query, dispatch]);

    const pageTitle = `Search ${query || ""} | departr`;

    console.dir(isLoading, error, results);

    return (
        <div>
            <Helmet>
                <title>{pageTitle}</title>
            </Helmet>

            {isLoading && <div>Loading...</div>}

            {!isLoading && !query && <div>Not loading, no query</div>}

            {!isLoading && error && (
                <div>{`Error ${error} occurred - see console for additional information`}</div>
            )}

            {!isLoading && !error && results.length === 0 && <div>No results</div>}

            {!isLoading && !error && results.length > 0 && (
                <div>
                    {`Results for ${query}:`}

                    <SearchResults results={results} />
                </div>
            )}
        </div>
    );
};

// ---- PropTypes ----

const SearchPropTypes = {
    query: PropTypes.string,
};
const SearchDefaultProps = {
    query: "",
};
Search.propTypes = SearchPropTypes;

export default Search;
