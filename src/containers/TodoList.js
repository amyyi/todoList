import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { fromJS, List } from 'immutable';
import { shouldComponentUpdate } from 'react-immutable-render-mixin';
import { connect } from 'react-redux';

import { getTodo, addTodo } from 'redux/modules/todo';
import TodoArea from '../components/TodoArea';
import ListContent from '../components/ListContent';
import Dialog from '../components/ModelEdit/Dialog';

// add
@connect(
  state => ({
    todo: state.todo,
  }), {
    getTodo,
    addTodo,
  }
)


export default class TodoList extends Component {

  static propTypes = {
    todo: ImmutablePropTypes.map.isRequired,
    getTodo: PropTypes.func.isRequired,
    addTodo: PropTypes.func.isRequired,
  };

  static defaultProps = {
  };

  constructor(props) {
    super(props);
    this.state = {
      todo: List(),
      focusIdx: 0,
      dialogName: '',
      show: '',
      editIdx: 0,
    };
    this._switchContext = this._switchContext.bind(this);
    this._addLists = this._addLists.bind(this);
    this._toggleDialog = this._toggleDialog.bind(this);
  }

  componentDidMount() {
    this.props.getTodo(); // must be call getTodo to action then get object
  }
  shouldComponentUpdate = shouldComponentUpdate;

  _switchContext(id, e) {
    const index = id;
    if (index !== this.state.focusIdx) {
      this.setState({ focusIdx: id });
    }
  }
  _toggleDialog(showclass, editIdx, dialogName, e) {
    if (showclass !== this.state.show) {
      this.setState({
        show: showclass,
        editIdx: editIdx,
        dialogName: dialogName,
      });
    }
  }
  _addLists(newObject, listName, e) {
    const todos = this.props.todo.toJS().todos;
    let newObj = newObject;
    const prefix = 'new-';
    let max = 0;
    const id = this.state.focusIdx;

    listName.forEach((name) => {

      //  startsWith可檢查開頭的字母為何
      //  這裡檢查開頭是否是new-
      if (name.startsWith(prefix)) {
        const idCount = +name.slice(prefix.length);
        max = idCount > max ? idCount : max;
      }
    });

    //  先判斷newObj為何？再決定new-max+1要加在哪裡
    const nameNumber = max + 1;
    if (newObj === 'new-') {
      newObj = prefix + nameNumber;
      todos[id].context.push(newObj);
    } else {
      newObj.title = prefix + nameNumber;
      todos.push(newObj);
    }
    return this.props.addTodo(todos);
  }
  renderTitle() {
    const todos = this.props.todo.toJS().todos;
    const newList = { title: '', context: [] };
    const listName = todos.map((title, i) => {
      return title.title;
    });
    return (
      <li onClick={() => this._addLists(newList, listName)}>
        <i className="fa fa-plus-circle">
          <span>Add Lists</span>
        </i>
      </li>
    );
  }
  render() {
    const { todo } = this.props;
    const todos = todo.toJS().todos;
    const { focusIdx, selected, show, editIdx, dialogName } = this.state;

    return (
      <div>
        <div className="list col-4">
          <ul className="ulStyle">
            {
              todos.map((data, i) => {
                return (
                  <TodoArea
                    key={`title_${i}`}
                    focusIdx={focusIdx}
                    classState={selected}
                    fun={this._switchContext}
                    dataId={i}
                    title={data.title}
                    toggleDialog={this._toggleDialog}
                  />
                );
              })
            }
          </ul>
          <ul>
            {this.renderTitle()}
          </ul>
        </div>
        <div className="list-content col-8">
          <ListContent
            todos={todos}
            focusIdx={focusIdx}
            fun={this._addLists}
            toggleDialog={this._toggleDialog}
          />
        </div>
        <Dialog
          showclass={show}
          focusIdx={focusIdx}
          toggleDialog={this._toggleDialog}
          editIdx={editIdx}
          todos={todos}
          todo={todo}
          dialogName={dialogName}
        />
      </div>
    );
  }
}
