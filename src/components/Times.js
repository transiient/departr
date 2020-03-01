import React from 'react';
import PT from 'prop-types';

import Service from './Service';
import { PTService } from './Service';

// todo: move into Service.js as List component
class Times extends React.Component {
    render() {
        let services = this.props.services || [];

        return (
            <div className="times">
                <ol>
                    { services.map((service, index) => (
                        <Service key={ index } index={ index } service={ service } />
                    ))}
                </ol>
            </div>
        );
    } // render()
}

// todo: expand "object"
Times.propTypes = {
    services: PT.arrayOf(PTService.isRequired).isRequired
}

export default Times;
