import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {shouldComponentUpdate} from 'react-immutable-render-mixin';
import {integerFilter, floatFilter} from 'utils/filters';

export default class FormInputText extends Component {

  static propTypes = {
    value: PropTypes.string,
    placeholder: PropTypes.string,
    type: PropTypes.string,
    onlyPositive: PropTypes.bool,
    className: PropTypes.string,
    style: PropTypes.object,
    maxLength: PropTypes.number,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
  };

  static defaultProps = {
    value: '',
    placeholder: '',
    type: 'text',
    onlyPositive: false,
    className: '',
    style: {},
  };

  constructor(props) {
    super(props);

    this.state = {
      value: props.value,
    };

    this.valueProceesor = (value = '') => {
      const {type, onlyPositive, maxLength} = this.props;
      let output = value;

      if (type === 'integer') {
        output = integerFilter(value, onlyPositive);
      } else if (type === 'float') {
        output = floatFilter(value, onlyPositive);
      }

      if (maxLength) {
        output = output.slice(0, maxLength);
      }
      return output;
    };
    this._handleOnChange = this._handleOnChange.bind(this);
    this._handleOnFocus = this._handleOnFocus.bind(this);
    this._handleOnBlur = this._handleOnBlur.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const {value} = this.props;
    const {value: nextValue} = nextProps;

    if (value !== nextValue) {
      this.setState({
        value: this.valueProceesor(nextValue),
      });
    }
  }

  shouldComponentUpdate = shouldComponentUpdate;

  _handleOnChange() {
    const {input} = this.refs;
    const {onChange} = this.props;
    const output = this.valueProceesor(input.value);

    if (onChange && typeof onChange === 'function') {
      onChange(output);
    }

    this.setState({
      value: output,
    });
  }

  _handleOnFocus() {
    const {onFocus} = this.props;

    if (onFocus && typeof onFocus === 'function') {
      onFocus();
    }
  }

  _handleOnBlur() {
    const {onBlur} = this.props;
    const {value} = this.state;

    if (onBlur && typeof onBlur === 'function') {
      onBlur(value);
    }
  }

  render() {
    const {placeholder, className, style} = this.props;
    const {value} = this.state;

    return (
      <input
        ref="input"
        className={className}
        style={style}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={this._handleOnChange}
        onFocus={this._handleOnFoucs}
        onBlur={this._handleOnBlur}
      />
    );
  }
}
