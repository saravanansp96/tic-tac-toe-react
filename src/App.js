import React from 'react';
import './App.css';
import SingleDevice from './components/SingleDevice';
import MultiDevice from './components/MultiDevice';
import Menu from './components/menu/Menu';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import DifficultyProvider from './Context/DifficultyProvider';
import Difficulty from './components/Difficulty';

function App() {

  return (
    <DifficultyProvider>
      <div className="App">
        <Router>
          <Switch>
            <Route path="/two-device">
              <MultiDevice />
            </Route>
            <Route path="/one-device">
              <SingleDevice />
            </Route>
            <Route path="/difficulty">
              <Difficulty timeLimit={50} />
            </Route>
            <Route path="/">
              <Menu />
            </Route>
          </Switch>
        </Router>
      </div>
    </DifficultyProvider>
  );
}

export default App;
