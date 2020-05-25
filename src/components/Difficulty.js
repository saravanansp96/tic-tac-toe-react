import React from 'react';
import { Link } from 'react-router-dom';
import { DifficultyContext } from '../Context/Difficulty';

class Difficulty extends React.Component {

    static contextType = DifficultyContext;

    Difficulties = [
        {
            label: "Easy",
            time: 10
        },
        {
            label: "Medium",
            time: 7
        },
        {
            label: "Hard",
            time: 5
        }
    ];

    render() {

        const difficultyList = this.Difficulties.map((difficulty, index) => {
            return (
                <DifficultyContext.Consumer key={index}>
                    {(context) => {
                        console.log(context);
                        const className = context.state.difficulty.label == difficulty.label ? "options active" : "options";
                        return (
                            <div className={className} onClick={()=> context.setDifficulty(difficulty)}>
                                <h2>{difficulty.label}</h2>
                                <h3>{difficulty.time + " seconds"}</h3>
                            </div>
                        );
                    }
                    }
                </DifficultyContext.Consumer>
            )
        });

        return (
            <div className="center-content difficulty-list">
                <div>
                    <h1 className="title">Tic Tac Toe</h1>
                    <h2>Select Difficulty</h2>
                    {difficultyList}
                </div>
                <Link className="text-decor-none" to="/">
                    <h3 className="link back">
                        Back
                </h3>
                </Link>
            </div>
        );
    }
}

export default Difficulty;