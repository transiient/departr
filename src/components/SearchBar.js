import React from 'react';
import { Redirect } from 'react-router-dom';

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

    render() {
        const placeholder = this.props.placeholder || '';

        if (this.state.shouldSearch === true) {
            // todo: this is causing error in render method
            //! fix asap
            //? how can shouldSearch be reset?
            /*
                Warning: Cannot update during an existing state transition
            */
            this.setState({ shouldSearch: false });
            return (<Redirect to={ '/search/' + this.state.searchQuery }/>);
        }

        return (
            <div className={ cn.searchBar + ' ' + this.props.className||'' }>
                <form onSubmit={ this.handleSubmit }>
                    <input
                        type="text"
                        name="SearchBar"
                        onChange={ this.handleChange }
                        placeholder={ placeholder }
                        value={ this.state.searchQuery } />
                    <button type="submit" className={ this.props.text ? cn.text : '' }>
                        { this.props.text && "Search" }
                        { !this.props.text && (<i className={"hide-material-icons material-icons " + cn.buttonIcon}>search</i>)}
                    </button>
                </form>
            </div>
        );
    }
}

export default SearchBar;