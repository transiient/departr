import React from 'react';
import { Link, NavLink } from 'react-router-dom';

import SearchBar from '../components/SearchBar';

import cn from './Header.module.scss';

const NLink = (props) => (
    <NavLink className={cn.navLink} activeClassName={cn.navLinkActive} exact={true} to={props.to}>
        {props.children}
    </NavLink>
)

class Header extends React.Component {
    render() {
        return (
            <div className={cn.wrapper}>
                <Link to="/">
                    <img className={cn.logo} src="/assets/image/logo-title.png" alt="Departr" />
                </Link>

                <div className={cn.navContainer}>
                    <ul className={cn.nav}>
                        <li><NLink to="/">Home</NLink></li>
                        <li><NLink to="/search">Search</NLink></li>
                        {/*<li><NLink to="/bus">Bus</NLink></li>*/}
                        {/*<li><NLink to="/bike">Bike</NLink></li>*/}
                    </ul>
                </div>

                <SearchBar handleSearch={ this.props.handleSearch } className={cn.searchBarHeader}  />
            </div>
        );
    }
}

export default Header;