import React from 'react';
// eslint-disable-next-line
import { BrowserRouter as Router, Route, Link } from 'react-router';

import cn from './Footer.module.scss';

class Footer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            //.
        }
    }

    render() {
        return (
            <div className={cn.wrapper}>
                <span className={cn.copy}>Created in BRI by <a href="https://sam-cross.github.io/">Sam Cross</a></span>
                <span className={cn.info}>Data obtained from the National Rail Enquiries API.
                    This website is not affiliated with NRE.</span>
            </div>
        );
    }
}

export default Footer;