import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import {
  DialogBase,
} from 'components';

export default class ModelListDialog extends Component {
  static propTypes = {
    model: ImmutablePropTypes.map.isRequired,
    switchEditFromDialog: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
    };
    this._switchEditFromDialog = this._switchEditFromDialog.bind(this);
  }
  _switchEditFromDialog() {
    const { model } = this.props;
    const isOpenFrom = model.get('openEditFromDialog');

    if (!isOpenFrom) {
      this.props.switchEditFromDialog();
    }
  }
  show() {
    const { dialog } = this.refs;
    dialog.show();
  }

  close() {
    const { dialog } = this.refs;
    dialog.close();
  }
}
