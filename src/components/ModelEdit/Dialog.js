import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { reduxForm, addArrayValue } from 'redux-form';
import { connect } from 'react-redux';

import { addTodo } from 'redux/modules/todo';
import validation from './validation';
import FormGroup from './FormGroup';


@connect(
  state => ({
    todo: state.todo,
  }), {
    addTodo,
  }
)

@reduxForm({
  form: 'TitleDialog',
  fields: ['title'],
  validate: validation,
},
  (state) => {
    return {
      initialValues: state.todo.get('todos').toJS(),  // will pull state into form's initialValues
    };
  })

export default class Dialog extends Component {
  static propTypes = {
    todo: ImmutablePropTypes.map.isRequired,
    todos: PropTypes.array,
    fields: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    invalid: PropTypes.bool.isRequired,
    submitting: PropTypes.bool.isRequired,
    toggleDialog: PropTypes.func.isRequired,
    showclass: PropTypes.string.isRequired,
    editIdx: PropTypes.number,
    dialogName: PropTypes.string.isRequired,
    focusIdx: PropTypes.number,
    addTodo: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      // value: '',
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.cancel = this.cancel.bind(this);
  }
  _resetForm() {
    const {
      fields: {
        title,
      },
    } = this.props;

    title.onChange('');
  }
  handleSubmit() {
    const { todo, dialogName, editIdx, focusIdx } = this.props;
    const dataName = dialogName === 'title' ? ['todos', editIdx, 'title'] : ['todos', focusIdx, 'context', editIdx];
    const inputValue = this.input.value;
    const afterValue = todo.setIn(dataName, inputValue);
    const newData = afterValue.toJS().todos;  // List array or Context array
    const empty = '';
    this.props.addTodo(newData);
    this.props.toggleDialog(empty, 0, empty);
    this._resetForm();
  }
  cancel() {
    const empty = '';
    this.props.toggleDialog(empty, 0, empty);
    this._resetForm();
  }
  render() {
    const {
      fields: {
        title,
      },
      showclass,
      todo,
      focusIdx,
      editIdx,
      dialogName,
      submitting,
      invalid,
    } = this.props;
    const dialogclass = showclass ? 'in show' : '';
    const dataName = dialogName === 'title' ? ['todos', editIdx, 'title'] : ['todos', focusIdx, 'context', editIdx];

    return (
      <div className={'signbox' + dialogclass}>

        <form className="signbox-form form">

          <FormGroup touched={title.touched} error={title.error}>
            <label className="form-input-title required">
              <h2>{todo.getIn(dataName)}</h2>
            </label>
            <input
              ref={(c) => { this.input = c; }}
              data-input={'input'}
              className="form-input icon-left"
              type="text"
              placeholder={todo.getIn(dataName)}
              {...title}
            />
          </FormGroup>

          <button
            className={`btn btn-primary signbox-submit submit`}
            type="submit"
            disabled={invalid || submitting}
            onClick={this.handleSubmit}
          >
            <span className="btn-text">
              Submit
            </span>
          </button>
          <button
            className={`btn btn-primary signbox-submit cancel`}
            type="submit"
            onClick={this.cancel}
          >
            <span className="btn-text">
              Cancel
            </span>
          </button>
        </form>

      </div>
    );
  }
}
