import React from 'react';
import { BrowserRouter as Router, withRouter, Route, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';

// PAGES
import Home from './pages/Home';
import Error from './pages/Error';
import ListDepartures from './pages/ListDepartures';
import Search from './pages/Search';

// COMPONENTS
import Header from './components/Header';
import Footer from './components/Footer';

// STYLES
import './App.scss';

let globalHistory;
class HistSpy extends React.Component {
    constructor(props) {
        super(props);

        globalHistory = props.history;
    }

    componentDidUpdate() {
        globalHistory = this.props.history;
    }

    render() {
        return null;
    }
}
export const GlobalHistory = withRouter(HistSpy);
export function getHistory() {
    return globalHistory;
}

class App extends React.Component {
    render() {
        return (
            <Router>
                <div className="App">
                    <GlobalHistory />

                    <Header />

                    <Switch>
                        <Route exact path="/" component={Home} />
                        <Route path="/search/:query" component={ (props) => (<Search {...props} />) } />
                        <Route exact path="/search/" component={ (props) => (<Search {...props} />) } />
                        <Route path="/:stationCrs([A-Z]{3})" component={ (props) => (
                            <ListDepartures { ...props } />
                        )} />

                        <Route path="/error/:errorID" component={ (props) => (<Error {...props} />) } />
                        <Route path="*" component={ (props) => (<Error errorID={"404"} {...props} />) } />
                    </Switch>

                    <Footer />
                </div>
            </Router>
        );
    }
}

export default App;