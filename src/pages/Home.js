import React from 'react';
import { Helmet } from 'react-helmet';
// eslint-disable-next-line
import SearchBar from '../components/SearchBar';

import cn from './Home.module.scss';

class Home extends React.Component {
    render() {
        return (
            <div className={"page " + cn.pageContainer}>
                <Helmet>
                    <title>Home | departr</title>
                </Helmet>

                <div className={cn.hero}>
                    Hello!
                </div>
            </div>
        );
    }
}

export default Home;