import React from 'react';

import Service from './Service';

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

export default Times;
