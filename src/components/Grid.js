import React from 'react';
import Tile from './Tile';
import StopWatch from './StopWatch';
import { Link, withRouter } from 'react-router-dom';
import { DifficultyContext } from '../Context/Difficulty';

class Grid extends React.Component {

    INITIAL_STATE = [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
    ];

    constructor(props) {
        super(props);
        this.state = {
            options: { ...this.INITIAL_STATE },
            isWon: false,
            turn: 0,
            triggerReset: false,
            isStoppwatchStopped: false
        };
        this.stopWatch = React.createRef();
        this.newGame = this.newGame.bind(this);
        this.addOption = this.addOption.bind(this);
        this.playAgain = this.playAgain.bind(this);
        this.handleResponse = this.handleResponse.bind(this);
        this.stopWatchStopped = this.stopWatchStopped.bind(this);
    }

    componentWillMount() {
        if (this.props.isMultiDevice && this.props.client) {
            this.props.client.onopen = () => {
                console.log('WebSocket Client Connected');
            };
            this.props.client.onmessage = (message) => {
                this.handleResponse(JSON.parse(message.data), this.props.client);
            };
        }
    }

    newGame() {
        console.log(this.INITIAL_STATE);
        this.stopWatch.current.reset();
        this.setState({
            options: { ...this.INITIAL_STATE },
            isWon: false,
            turn: 0
        });
    }

    handleResponse(response, client) {
        console.log(response);
        if ((response.isSuccess && response.type)) {
            if (response.type === "play-again-response") {
                this.newGame();
            }
        }
        if (!response.isSuccess && response.type === "play-again-response") {
            alert("Can't Play right now.");
            this.props.history.push("/");
        }
        if (response.type === "play-again-request") {
            let requestData = {
                type: "play-again-response",
                groupName: this.props.groupName,
                isSuccess: null
            };
            if (window.confirm("Do you want to play again?")) {
                // new Game and send response msg
                requestData.isSuccess = true;
                console.log(requestData);
                client.send(JSON.stringify(requestData));
                this.newGame();
            } else {
                requestData.isSuccess = false;
                client.send(JSON.stringify(requestData));
                client.close();
                this.props.history.push("/");
                // go to menu page
            }
        }

        if (response.type === "game-play") {
            console.log(this.state);
            if (response.isWon) {
                this.stopWatch.current.stopTime();
            } else {
                this.stopWatch.current.reset();
            }
            this.setState({
                options: response.options,
                turn: response.turn,
                isWon: response.isWon
            });
        }
    }

    stopWatchStopped() {
        this.setState({
            isWon: true,
            isStoppwatchStopped: true
        });
    }

    playAgain() {
        if (this.props.isMultiDevice) {
            let requestData = {
                type: "play-again-request",
                groupName: this.props.groupName
            };
            console.log(requestData);
            this.props.client.send(JSON.stringify(requestData));
        } else {
            this.newGame();
        }
    }

    addOption(index) {
        const SYMBOL = (this.state.turn % 2 === 0) ? "X" : "O";
        let newState = { ...this.state };

        if (this.props.isMultiDevice && SYMBOL === this.props.playerSymbol) {
            
            this.stopWatch.current.reset();

            newState.options[index] = SYMBOL;
            newState.turn++;
            this.setState(newState);
            if (this.isPlayerWon(SYMBOL)) {
                newState.isWon = true;

                this.stopWatch.current.stopTime();

                this.setState({
                    isWon: true
                });
            }
            let request = newState;
            request.groupName = this.props.groupName;
            request.type = "game-play";
            console.log(request);
            this.props.client.send(JSON.stringify(request));
        }
        if (!this.props.isMultiDevice) {

            this.stopWatch.current.reset();
            
            newState.options[index] = SYMBOL;
            newState.turn++;
            this.setState(newState);
            if (this.isPlayerWon(SYMBOL)) {

                this.stopWatch.current.stopTime();

                this.setState({
                    isWon: true
                });
            }
        }
    }

    isPlayerWon(symbol) {
        // horizontal check
        let isPlayerWon = this.straightLineCheck(true, symbol);

        // vertical check
        if (!isPlayerWon) {
            isPlayerWon = this.straightLineCheck(false, symbol);
        }

        // forward diagonal check
        if (!isPlayerWon) {
            isPlayerWon = this.diagonalCheck(true, symbol);
        }

        // backward diagonal check
        if (!isPlayerWon) {
            isPlayerWon = this.diagonalCheck(false, symbol);
        }

        return isPlayerWon;
    }

    straightLineCheck(isHorizontal, symbol) {
        let iterator1Limit, iterator2Limit, incrementor1, incrementor2, isPlayerWon = true;

        if (isHorizontal) {
            iterator1Limit = 9;
            incrementor1 = 3;
            iterator2Limit = 3;
            incrementor2 = 1;
        } else {
            iterator1Limit = 3;
            incrementor1 = 1;
            iterator2Limit = 9;
            incrementor2 = 3;
        }
        for (let iterator1 = 0; iterator1 < iterator1Limit; iterator1 += incrementor1) {
            for (let iterator2 = 0; iterator2 < iterator2Limit; iterator2 += incrementor2) {
                if (symbol !== this.state.options[iterator1 + iterator2]) {
                    isPlayerWon = false;
                    break;
                }
                isPlayerWon = true;
            }
            if (isPlayerWon) {
                break;
            }
        }

        return isPlayerWon;
    }

    diagonalCheck(isForward, symbol) {
        let iteratorStartsWith, incrementor, isPlayerWon = true;

        if (isForward) {
            iteratorStartsWith = 0;
            incrementor = 4;
        } else {
            iteratorStartsWith = 2;
            incrementor = 2;
        }

        for (let iterator = iteratorStartsWith, iterator2 = 0; iterator2 < 3; iterator += incrementor, iterator2++) {
            if (symbol !== this.state.options[iterator]) {
                isPlayerWon = false;
                break;
            }
        }

        return isPlayerWon;
    }

    render() {

        const SYMBOL = ((this.state.turn) % 2 === 0) ? "X" : "O";
        const WINNER = ((this.state.turn - 1) % 2 === 0) ? "X" : "O";

        let message;


        if (this.state.isStoppwatchStopped) {
            if (this.props.isMultiDevice) {
                message = this.state.playerSymbol === WINNER ? "You Won !!!" : "You Lost !!!";
            } else {
                message = WINNER + " Won !!!";
            }
        } else {
            if (this.state.isWon) {
                if (this.props.isMultiDevice) {
                    message = this.state.playerSymbol === WINNER ? "You Won !!!" : "You Lost !!!";
                } else {
                    message = WINNER + " Won !!!";
                }
                message = (<div><h2>{WINNER + " WON!!!"}</h2><div className="pointer" onClick={this.playAgain}>Play Again</div></div>);
            }

            if (!this.state.isWon && this.state.turn === 9) {
                message = " DRAW !!!";
            }
        }

        let winnerMessage = (<div><h2>{message}</h2><div className="pointer" onClick={this.playAgain}>Play Again</div></div>);

        let playerStatus = this.props.isMultiDevice ? (
            <div>
                <span className="legend"> {"You are " + this.props.playerSymbol + " "}  {SYMBOL === this.props.playerSymbol ? "Your Turn" : "Opponent Turn"} </span>
            </div>
        ) : null;

        let timmer = this.props.isMultiDevice ? (
            <StopWatch timeLimit={this.props.time} ref={this.stopWatch} stop={this.stopWatchStopped} />
        ) : (
                <DifficultyContext.Consumer>
                    {
                        (context) => {
                            return (<StopWatch timeLimit={context.state.difficulty.time} ref={this.stopWatch} stop={this.stopWatchStopped} />);
                        }
                    }
                </DifficultyContext.Consumer>
            );



        return (
            <div>
                {timmer}
                <div>
                    {playerStatus}
                    <div>
                        <Tile
                            index="0"
                            symbol={this.state.options[0]}
                            clicked={this.addOption}
                            isWon={this.state.isWon} />
                        <Tile
                            index="1"
                            symbol={this.state.options[1]}
                            clicked={this.addOption}
                            isWon={this.state.isWon} />
                        <Tile
                            index="2"
                            symbol={this.state.options[2]}
                            clicked={this.addOption}
                            isWon={this.state.isWon} />

                    </div>
                    <div>
                        <Tile
                            index="3"
                            symbol={this.state.options[3]}
                            clicked={this.addOption}
                            isWon={this.state.isWon} />
                        <Tile
                            index="4"
                            symbol={this.state.options[4]}
                            clicked={this.addOption}
                            isWon={this.state.isWon} />
                        <Tile
                            index="5"
                            symbol={this.state.options[5]}
                            clicked={this.addOption}
                            isWon={this.state.isWon} />

                    </div>
                    <div>
                        <Tile
                            index="6"
                            symbol={this.state.options[6]}
                            clicked={this.addOption}
                            isWon={this.state.isWon} />
                        <Tile
                            index="7"
                            symbol={this.state.options[7]}
                            clicked={this.addOption}
                            isWon={this.state.isWon} />
                        <Tile
                            index="8"
                            symbol={this.state.options[8]}
                            clicked={this.addOption}
                            isWon={this.state.isWon} />

                    </div>
                </div>
                <h3 className="winner">{message}</h3>
            </div>
        );
    }
}

export default withRouter(Grid);