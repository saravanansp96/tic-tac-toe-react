import React from "react";
import { Link, withRouter } from 'react-router-dom';
import Grid from "./Grid";
import { DifficultyContext } from '../Context/Difficulty';

let client = new WebSocket('ws://192.168.1.4:8282');


class MultiDevice extends React.Component {

    static contextType = DifficultyContext;

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
            groupName: "",
            error: {
                groupName: ""
            },
            timeLimit: "",
            isWon: false,
            playerSymbol: "",
            opponentSymbol: "",
            isPlayerJoined: false,
            turn: 0
        };
        this.newGame = this.newGame.bind(this);
        this.addOption = this.addOption.bind(this);
        this.create = this.create.bind(this);
        this.join = this.join.bind(this);
        this.playAgain = this.playAgain.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    componentWillMount() {
        client.onopen = () => {
            console.log('WebSocket Client Connected');
        };
        client.onmessage = (message) => {
            this.handleResponse(JSON.parse(message.data), client);
        };
    }

    newGame() {
        console.log(this.INITIAL_STATE);
        this.setState({
            options: { ...this.INITIAL_STATE },
            isWon: false,
            turn: 0
        });
    }

    handleResponse(response, client) {
        console.log(response);
        if ((response.isSuccess && response.type)) {
            if (response.type === "create-group") {
                console.log(response);
                this.setState({
                    "isPlayerJoined": true,
                    "timeLimit": response.timeLimit,
                    "playerSymbol": "X"
                });

                console.log(this.state);
            }

            if (response.type === "join-group") {
                this.setState({
                    "isPlayerJoined": true,
                    "playerSymbol": "O",
                    "opponentSymbol": "X",
                    "timeLimit": response.timeLimit
                });

                console.log(this.state);
            }

            if (response.type === "opponent-joined") {
                this.setState({
                    "isPlayerJoined": true,
                    "opponentSymbol": "O"
                });

                console.log(this.state);
            }
            if(response.type === "play-again-response") {
                this.newGame();
            }
        }
        if(response.type === "play-again-request") {
            let requestData = {
                type: "play-again-response",
                groupName: this.state.groupName,
                isSuccess: null
            };
            if(window.confirm("Do you want to play again?")) {
                // new Game and send response msg
                requestData.isSuccess = true;
                console.log(requestData);
                client.send(JSON.stringify(requestData));
                this.newGame();
            } else {
                requestData.isSuccess = false;
                client.send(JSON.stringify(requestData));
                // clear the group entry
                this.props.history.push("/");
                // go to menu page
            }
        }
        if(!response.isSuccess && response.type === "play-again-response") {
            alert("Can't Play right now.");
            this.props.history.push("/");
        }
        if(!response.isSuccess) {
            this.setState({
                "error" : {
                    "groupName" : response.message
                }
            })
        }
        if (response.type === "game-play") {
            console.log(this.state);
            this.setState({
                options: response.options,
                turn: response.turn,
                isWon: response.isWon
            });
        }
    }

    addOption(index) {
        const SYMBOL = (this.state.turn % 2 === 0) ? "X" : "O";
        if (SYMBOL === this.state.playerSymbol) {
            let newState = { ...this.state };
            newState.options[index] = SYMBOL;
            newState.turn++;
            this.setState(newState);
            if (this.isPlayerWon(SYMBOL)) {
                newState.isWon = true;
                this.setState({
                    isWon: true
                });
            }
            let request = newState;
            request.type = "game-play";
            console.log(request);
            client.send(JSON.stringify(request));
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

    playAgain() {
        let requestData = {
            type: "play-again-request",
            groupName: this.state.groupName
        };
        console.log(requestData);
        client.send(JSON.stringify(requestData));
    }

    join() {
        let group = this.state.groupName;
        let requestData = {
            type: "join-group",
            name: group
        }
        console.log(requestData);
        client.send(JSON.stringify(requestData));
    }

    create() {
        let group = this.state.groupName;
        let requestData = {
            type: "create-group",
            name: group,
            timeLimit: this.context.state.difficulty.time
        }
        console.log(requestData);
        client.send(JSON.stringify(requestData));
    }

    handleInputChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        let newState = { ...this.state };
        newState[name] = value;

        this.setState(
            newState
        );
    }

    render() {
        
        let content = null;

        const errorStyle = {
            "border": "1px solid red"
        }
        
        const WINNER = ((this.state.turn - 1) % 2 === 0) ? "X" : "O";

        let message;

        if (this.state.isWon) {
            message = (<div><h2>{WINNER + " WON!!!"}</h2><div className="pointer" onClick={this.playAgain}>Play Again</div></div>);
        }

        if (!this.state.isWon && this.state.turn === 9) {
            message = (<div><h2>{" DRAW !!!"}</h2><div className="pointer" onClick={this.playAgain}>Play Again</div></div>);
        }

        if (this.state.playerSymbol === "") {
            content = (
                <div>
                    <div className="split">
                        <label>
                            <input type="text" onChange={this.handleInputChange} name="groupName" style={this.state.error.groupName ? errorStyle : null} className="text-box" id="group" placeholder="Room Name" required />
                            <p className="error">{this.state.error.groupName}</p>
                        </label>
                        <br />
                        <button className="btn" onClick={this.create} >Create</button>
                        <button className="btn" onClick={this.join} >Join</button>
                    </div>
                </div>
            );
        } else if (this.state.opponentSymbol === "") {
            content = (
                <div>
                    waiting for opponent ...
                </div>
            );
        } else {
            content = (
                <Grid isMultiDevice={true} client={client} playerSymbol={this.state.playerSymbol} opponentSymbol={this.state.opponentSymbol3} groupName={this.state.groupName} time={this.state.timeLimit} />
            );
        }

        return (
            <div className="center-content multi-device">
                <div>
                    <h1 className="title">Tic Tac Toe</h1>
                    {content}
                    <Link className="text-decor-none" to="/">
                        <h3 className="link back">
                            Back
                        </h3>
                    </Link>
                </div>
            </div>
        );
    }
}

export default withRouter(MultiDevice);