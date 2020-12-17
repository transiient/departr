import React from 'react';
import PropTypes from 'prop-types';
import InferPropTypes from '../types/InferPropTypes';


const Home = (props: HomeProps) => {
    return (
        <div>
            Home
        </div>
    );
};

// ---- PropTypes ----

const HomePropTypes = {
    test: PropTypes.string.isRequired
};
const HomeDefaultProps = {
    test: ''
};
Home.propTypes = HomePropTypes;

type HomeProps = InferPropTypes<
    typeof HomePropTypes,
    typeof HomeDefaultProps
>;

export default Home;