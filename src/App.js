import "./normalize.css";
import "./styles.scss";

import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Enter from "./components/Enter";
import Form from "./components/Form";
import RoomsList from "./components/RoomsList";
import Chat from "./components/Chat";

function App() {
  return (
    <div className="wrapper">
      <Router>
        <Switch>
          <Route exact path="/" component={RoomsList}></Route>
          <Route path="/enter" component={Enter}></Route>
          <Route path="/sign-up" component={Form}></Route>
          <Route path="/login" component={Form}></Route>
          <Route path="/new-room" component={Form}></Route>
          <Route path="/:room" component={Chat}></Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
