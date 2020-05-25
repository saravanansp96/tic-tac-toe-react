import React from "react";
import Grid from './Grid';
import { Link } from 'react-router-dom';

const SingleDevice = (props) => {

    return (
        <div className="center-content multi-device">
            <div>
                <h1 className="title">Tic Tac Toe</h1>
                <Grid isMultiDevice={false} client={null} />
                <Link className="text-decor-none" to="/">
                    <h3 className="link back">
                        Back
                        </h3>
                </Link>
            </div>
        </div>
    );
}

export default SingleDevice;