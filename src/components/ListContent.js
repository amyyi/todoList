import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { shouldComponentUpdate } from 'react-immutable-render-mixin';

export default class ListContent extends Component {
  static propTypes = {
    fun: PropTypes.func.isRequired,
    todos: PropTypes.array,
    focusIdx: PropTypes.number,
    data: PropTypes.string,
    toggleDialog: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this._addLists = this._addLists.bind(this);
    this._toggleDialog = this._toggleDialog.bind(this);
  }
  shouldComponentUpdate = shouldComponentUpdate;

  _addLists(newContext, contextData) {
    this.props.fun(newContext, contextData);
  }

  _toggleDialog(e) {
    const index = e.currentTarget.getAttribute('data-index');
    this.props.toggleDialog('show', index, 'context');
  }

  renderBtn(i) {
    return (
      <span
        className="context-edit"
        data-index={i}
        onClick={this._toggleDialog}
      >
        <i className="fa fa fa-plus-circle"></i>edit
      </span>
    );
  }

  renderContextTitle() {
    const { todos, focusIdx } = this.props;
    const contextData = todos[focusIdx] ? todos[focusIdx].context : todos;
    const newContext = 'new-';

    return (
      <button>
        <i
          className="fa fa-plus"
          aria-hidden="true"
          onClick={() => this._addLists(newContext, contextData)}
        >
        </i>
      </button>
    );
  }

  render() {
    const { todos, focusIdx } = this.props;
    const contextTitle = todos[focusIdx] ? todos[focusIdx].title : '';
    const contextData = todos[focusIdx] ? todos[focusIdx].context : todos;

    return (
      <div>
        <div className="contentTitle">
          <h2>{contextTitle}</h2>
          {this.renderContextTitle()}
        </div>
        <ul>
          {
            contextData.map((data, i) => {
              return (
                <li
                  className="context-li"
                  key={`context_${i}`}
                >
                  <span className="col-5">{data}</span>
                  {this.renderBtn(i)}
                </li>
                );
            })
          }
        </ul>
      </div>
    );
  }
}
