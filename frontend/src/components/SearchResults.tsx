import React from 'react';
import PropTypes from 'prop-types';
import InferPropTypes from '../types/InferPropTypes';

const SearchResults = (props: SearchResultsProps) => {
    console.log(props);
    return (
        <div>
            {
                props.results.map((item: any) => {
                    return (<div>{item.crs}</div>)
                })
            }
        </div>
    );
}

// ---- PropTypes ----

const SearchResultsPropTypes = {
    results: PropTypes.any.isRequired
};
const SearchResultsDefaultProps = {
    data: []
};
SearchResults.propTypes = SearchResultsPropTypes;
SearchResults.defaultProps = SearchResultsDefaultProps;

type SearchResultsProps = InferPropTypes<
    typeof SearchResultsPropTypes,
    typeof SearchResultsDefaultProps
>;

export default SearchResults