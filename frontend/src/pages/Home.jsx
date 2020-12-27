import React from "react";
import PropTypes from "prop-types";

const Home = (props) => {
    return <div>Home</div>;
};

// ---- PropTypes ----

const HomePropTypes = {
    test: PropTypes.string.isRequired,
};
const HomeDefaultProps = {
    test: "",
};
Home.propTypes = HomePropTypes;

export default Home;
