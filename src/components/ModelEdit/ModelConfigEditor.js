import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { shouldComponentUpdate } from 'react-immutable-render-mixin';
import { ModelListDialog } from './ModelListDialog';
import {
  getModelConfig,
  switchEditFromDialog,
} from 'redux/modules/model';

@connect(
  state => ({
    model: state.model,
  }), {
    getModelConfig,
    switchEditFromDialog,
  }
)

export default class ModelConfigEditor extends Component {

  static propTypes = {
    model: ImmutablePropTypes.map.isRequired,
    getModelConfig: PropTypes.func.isRequired,
    switchEditFromDialog: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.openModelEditDialog = this.openModelEditDialog.bind(this);
    this._openModelListDialog = this._openModelListDialog.bind(this);
  }

  _openModelListDialog() {
    this.refs.modelListDialog.show();
  }

  openModelEditDialog(type) {
    this.refs.modelEditDialog.show(type);
  }

  render() {
    const { model } = this.props;

    return (
      <div>
        <button className="btn" type="button" onClick={this._openModelListDialog}>Edit</button>
        <ModelListDialog
          ref="modelListDialog"
          model={model}
          openModelEditDialog={this.openModelEditDialog}
          getModelConfig={this.props.getModelConfig}
          switchEditFromDialog={this.props.switchEditFromDialog}
        />
      </div>
    );
  }
}
