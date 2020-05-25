import React from "react";

class StopWatch extends React.Component {

    fullDashedArray = 283;

    initialState = {
        timeLeft: this.props.timeLimit,
        timePassed: 0,
        circleDasharray: this.fullDashedArray
    };

    state = this.initialState;

    componentDidMount() {
        this.timerID = setInterval(
            () => this.tick(),
            1000
        );
    }

    componentWillUnmount() {
        this.stopTime();
    }

    stopTime() {
        clearInterval(this.timerID);
    }

    reset() {
        this.stopTime();
        this.setState(this.initialState);
        this.timerID = setInterval(
            () => this.tick(),
            1000
        );
    }

    tick() {
        const TIME_LIMIT = this.props.timeLimit;
        let newState = { ...this.state };
        newState.timeLeft--;
        newState.timePassed++;

        let timeFraction = newState.timeLeft / TIME_LIMIT;
        timeFraction = timeFraction - (1 / TIME_LIMIT) * (1 - timeFraction);
        newState.circleDasharray =(timeFraction * this.fullDashedArray).toFixed(0)+", "+this.fullDashedArray;

        this.setState(newState);
        if (!newState.timeLeft) {
            // call the function from parent comp on timer stop
            this.stopTime();
            this.props.stop();
        }
    }

    render() {
        const warningThreshold = this.props.timeLimit/2;
        const alertThreshold = this.props.timeLimit/4;

        let color;

        if(this.state.timeLeft > warningThreshold) {
            color = "green";
        } else if(this.state.timeLeft > alertThreshold) {
            color = "yellow";
        } else {
            color = "red";
        }

        let style = {
            stroke: color
        };

        if (this.state.timeLeft === this.props.timeLimit) {
            style.transition = "0s linear all";
        }

        return (
            <div>
                <div className="base-timer">
                    <svg className="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <g className="base-timer__circle">
                            <circle className="base-timer__path-elapsed" cx="50" cy="50" r="45" />
                            <path
                                id="base-timer-path-remaining"
                                style = {style}
                                strokeDasharray={this.state.circleDasharray}
                                className="base-timer__path-remaining green"
                                d="
                                    M 50, 50
                                    m -45, 0
                                    a 45,45 0 1,0 90,0
                                    a 45,45 0 1,0 -90,0
                                "
                            ></path>
                        </g>
                    </svg>
                    <span id="base-timer-label" className="base-timer__label">
                        {this.state.timeLeft}
                    </span>
                </div>
            </div>
        );
    }
}

export default StopWatch;