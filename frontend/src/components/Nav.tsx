import React from 'react';
// import PropTypes from 'prop-types';
import InferPropTypes from '../types/InferPropTypes';

function Nav(props: NavProps) {
    return (
        <nav>
            Navigation
        </nav>
    );
}

// ---- PropTypes ----

const NavPropTypes = {
};
const NavDefaultProps = {
};
Nav.propTypes = NavPropTypes;

type NavProps = InferPropTypes<
    typeof NavPropTypes,
    typeof NavDefaultProps
>;

export default Nav;

