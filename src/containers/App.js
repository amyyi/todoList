import React, {Component} from 'react';
import TodoList from '../containers/TodoList';

export default class App extends Component {
  render() {
    return (
      <div className="container">
        <TodoList />
      </div>
    );
  }
}
