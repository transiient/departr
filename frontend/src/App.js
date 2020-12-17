import React, { useEffect } from 'react';
import { BrowserRouter as Router, withRouter, Route, Switch } from 'react-router-dom';

// PAGES
import Home from './pages/Home';
import Search from './pages/Search';

// COMPONENTS
import Nav from './components/Nav';

// STYLES
import './App.scss';

const Error = () => { return (<div>Error</div>); };

let globalHistory;
const HistSpy = (props) => {
    useEffect(() => globalHistory = props.history);
    return null;
};
export const GlobalHistory = withRouter(HistSpy);
export function getHistory() {
    return globalHistory;
}

export const App = (props) => {
    return (
        <Router>
            <div className="App">
                <GlobalHistory />

                <Nav />

                <Switch>
                    <Route exact path="/" component={Home} />
                    <Route path="/search/:query?" component={(props) => (
                        <Search query={props.match.params.query || ''} {...props} />
                    )} />

                    {/*
                        /search
                            /:query
                                ?filters=
                        /rail
                            /:serviceID
                            /:crs
                                /details
                                /departures
                                /timetables
                        /bus
                            /
                            /:operator
                                /:serviceID
                        /bike
                            ...
                        /journey
                            ...
                    */}

                    <Route path="/error/:errorID" component={(props) => (<Error {...props} />)} />
                    <Route path="*" component={(props) => (<Error errorID={"404"} {...props} />)} />
                </Switch>
            </div>
        </Router>
    );
};

export default App;