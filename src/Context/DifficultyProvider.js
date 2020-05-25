import React from 'react';
import { DifficultyContext } from './Difficulty';

class DifficultyProvider extends React.Component {

    state = {
        difficulty: {
            label: "Easy",
            time: 10
        }
    };

    setDifficulty = (difficulty) => {
        this.setState({
            difficulty: difficulty
        });
    }

    render() {

        console.log({
            state: this.state,
            "setState" : this.setState
        });
        return (
            <DifficultyContext.Provider
                value={{
                    state: this.state,
                    setDifficulty : this.setDifficulty
                }}
            >
                {this.props.children}
            </DifficultyContext.Provider>
        )
    }
}

export default DifficultyProvider;