import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {shouldComponentUpdate} from 'react-immutable-render-mixin';

export default class FormGroup extends Component {

  static propTypes = {
    children: PropTypes.any,
    className: PropTypes.string,
    touched: PropTypes.bool,
    error: PropTypes.string,
  };

  static defaultProps = {
    className: ''
  };

  constructor(props) {
    super(props);
  }

  shouldComponentUpdate = shouldComponentUpdate;

  render() {

    const { children, className, touched, error } = this.props;
    const hasErrorClass = touched && error ? 'has-error' : '';

    return (
      <div className={`form-group ${className} ${hasErrorClass}`}>
        {children}
        {hasErrorClass && <span className="form-errmsg">{error}</span>}
      </div>
    );
  }
}
