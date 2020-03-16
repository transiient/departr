import React from 'react';
import PT from 'prop-types';
import classnames from 'classnames';

import Service from './Service';
import { PTService } from '../types/Service';

// todo: move into Service.js as List component
class Times extends React.Component {
    render() {
        let services = this.props.services || [];

        return (
            <div className={classnames("times", this.props.classNames)}>
                <ol>
                    {services.map((service, index) => (
                        <Service key={index} index={index} service={service} />
                    ))}
                </ol>
            </div>
        );
    } // render()
}

// todo: expand "object"
Times.propTypes = {
    services: PT.arrayOf(PTService.isRequired).isRequired
};

export default Times;
