import React from 'react';
import { Link } from 'react-router-dom';


const Menu = (props) => {
    return (
        <div className="center-content">
            <div>
                <h1 className="title">Tic Tac Toe</h1>

                <Link className="text-decor-none" to="/one-device">
                    <div className="options">
                        <h2>2 Player - 1 Device</h2>
                    </div>
                </Link>
                <Link className="text-decor-none" to="/two-device">
                    <div className="options">
                        <h2>2 Player - 2 Device</h2>
                    </div>
                </Link>
                <Link className="text-decor-none" to="/difficulty">
                    <div className="options">
                        <h2>Difficulty</h2>
                    </div>
                </Link>
            </div>
        </div>
    );
}

export default Menu;