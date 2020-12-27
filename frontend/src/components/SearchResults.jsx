import React from "react";
import PropTypes from "prop-types";

const SearchResults = (props) => {
    return (
        <div>
            {props.results.map((item) => {
                return <div>{item.crs}</div>;
            })}
        </div>
    );
};

// ---- PropTypes ----

const SearchResultsPropTypes = {
    results: PropTypes.any.isRequired,
};
const SearchResultsDefaultProps = {
    data: [],
};
SearchResults.propTypes = SearchResultsPropTypes;
SearchResults.defaultProps = SearchResultsDefaultProps;

export default SearchResults;
