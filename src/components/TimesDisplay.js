import React from 'react';
import { connect } from 'react-redux';

import Service from './Service';

class Times extends React.Component {
    componentDidMount() {

    }

    render() {
        // note + todo: service.std is scheduled
        // if .etd is "On time" display std
        // otherwise, if it's "Delayed", change
        // colour of departureTime

        let services = this.props.services || [];

        return (
            <div className="timesDisplay">
                <ol>
                    { services.map((service, index) => (
                        <Service key={ index } index={ index } service={ service } />
                    ))}
                </ol>
            </div>
        );
    } // render()
}

const mapStateToProps = (store) => {
    return {
        station: store.station
    }
}

export default connect(
    mapStateToProps
)(Times);
