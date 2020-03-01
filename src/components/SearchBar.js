import React from 'react';
import { getHistory } from '../App';

import cn from './SearchBar.module.scss';

class SearchBar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            searchQuery: this.props.initialSearchQuery||'',
            shouldSearch: false
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e) {
        this.setState({
            searchQuery: e.target.value,
            shouldSearch: false
        });
    }

    handleSubmit(e) {
        e.preventDefault();

        if (this.state.searchQuery.length < 3)
            return;
        
        this.setState({
            shouldSearch: true
        });
    }

    componentDidUpdate() {
        if (this.state.shouldSearch === true) {
            this.setState({ shouldSearch: false });
            getHistory().push('/search/' + this.state.searchQuery);
        }
    }

    render() {
        const placeholder = this.props.placeholder || '';
        const useText = this.props.text || false;

        return (
            <div className={ cn.searchBar + ' ' + this.props.className||'' }>
                <form onSubmit={ this.handleSubmit }>
                    <input
                        type="text"
                        name="SearchBar"
                        onChange={ this.handleChange }
                        placeholder={ placeholder }
                        value={ this.state.searchQuery } />
                    <button type="submit" className={ useText ? cn.text : '' }>
                        { useText && "Search" }
                        { !useText && (<i className={"hide-material-icons material-icons " + cn.buttonIcon}>search</i>)}
                    </button>
                </form>
            </div>
        );
    }
}

// todo: does this need PropTypes? Doesn't seem so.

export default SearchBar;