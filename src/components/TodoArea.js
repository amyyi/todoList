import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { shouldComponentUpdate } from 'react-immutable-render-mixin';

export default class TodoArea extends Component {
  static propTypes = {
    todos: PropTypes.array,
    fun: PropTypes.func.isRequired,
    toggleDialog: PropTypes.func.isRequired,
    focusIdx: PropTypes.number,
    dataId: PropTypes.number,
    title: PropTypes.string,
  };

  constructor(props) {
    super(props);

    this._switchContext = this._switchContext.bind(this);
    this._toggleDialog = this._toggleDialog.bind(this);
  }
  shouldComponentUpdate = shouldComponentUpdate;

  _switchContext(dataId) {
    this.props.fun(dataId);
  }

  _toggleDialog(editIdx) {
    this.props.toggleDialog('show', editIdx, 'title');
  }

  renderBtn() {
    const { dataId } = this.props;
    return (
      <span
        className="list-edit col-5"
        onClick={() => this._toggleDialog(dataId)}
      >
        <i className="fa fa fa-plus-circle"></i>edit
      </span>
    );
  }

  render() {
    const { focusIdx, dataId, title } = this.props;
    const isFocus = dataId === focusIdx;
    const active = isFocus ? 'active' : '';
    return (
      <li
        className={active}
        onClick={() => this._switchContext(dataId)}
        data-id={dataId}
      >
        <span className="col-5">{title}</span>
        {this.renderBtn()}
      </li>
    );
  }
}
