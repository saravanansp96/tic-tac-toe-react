import React from 'react';

export default function Tile(props) {
    let classList = [
        "tile",
        "tile-" + (parseInt(props.index) + 1)
    ];

    if(props.symbol === "X") {
        classList.push("color-red");
    } else if(props.symbol === "O") {
        classList.push("color-blue");
    } else {
        classList.push("pointer");
    }
    
    return (
        <div className={classList.join(" ")}
            onClick={(!props.symbol && !props.isWon) ? () => props.clicked(props.index) : null}>
            {props.symbol}
        </div>
    );
}