import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import cn from './Error.module.scss';

class Error extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            errorID: this.props.errorID || this.props.match.params.errorID
        };

        this._goBack = this._goBack.bind(this);
    }

    _getErrorStatement(eid) {
        if (!!eid)
            eid = eid.toString();
        switch (eid) {
            case "404":
                return ("We couldn't find that page. Double-check the address and try again!");
            case "500":
                return ("Something happened on our end that prevented this page from loading. Try again later!");
            default:
                return ("An error occurred, and we don't quite know what it is. If it's important, contact us and quote this code: RTE" + eid);
        }
    }

    _goBack() {
        this.props.history.goBack();
    }

    render() {
        const pageTitle = ("Error (" + this.state.errorID + ") | departr");
        return (
            <div className={"page " + cn.pageContainer}>
                <Helmet>
                    <title>{pageTitle}</title>
                </Helmet>

                <span>{this._getErrorStatement(this.state.errorID || null)}</span>

                <button onClick={this._goBack}>Go back</button>
                <Link to="/">Go home</Link>
            </div>
        );
    }
}

export default Error;