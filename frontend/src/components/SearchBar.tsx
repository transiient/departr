import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getHistory } from '../App';
import InferPropTypes from '../types/InferPropTypes';

const SearchBar = (props: SearchBarProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [shouldSearch, setShouldSearch] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setShouldSearch(false);
        setSearchQuery(query);
    }
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        if (searchQuery.length < 3)
            return

        setShouldSearch(true);
    }

    useEffect(() => {
        if (shouldSearch) {
            setShouldSearch(false);
            getHistory().push(`/search/${searchQuery}`);
        }
    }, [shouldSearch, searchQuery]);

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="SearchBar"
                    onChange={handleChange}
                    placeholder={props.placeholder || ''}
                    value={searchQuery} />
                <button type="submit">
                    Search
                </button>
            </form>
        </div>
    );
}

// ---- PropTypes ----

const SearchBarPropTypes = {
    classNames: PropTypes.string,
    previousSearchQuery: PropTypes.string,
    placeholder: PropTypes.string,
};
const SearchBarDefaultProps = {
    classNames: '',
    previousSearchQuery: '',
    placeholder: 'Search',
};
SearchBar.propTypes = SearchBarPropTypes;
SearchBar.defaultProps = SearchBarDefaultProps;

type SearchBarProps = InferPropTypes<
    typeof SearchBarPropTypes,
    typeof SearchBarDefaultProps
>;

export default SearchBar;