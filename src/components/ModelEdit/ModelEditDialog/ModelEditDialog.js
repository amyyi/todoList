import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import {DialogBase} from 'components';
import ModelEditDialogForm from './ModelEditDialogForm';
import DatatableRowModelEditForm from './DatatableRowModelEditForm';

export default class ModelEditDialog extends Component {

  static propTypes = {
    model: ImmutablePropTypes.map.isRequired,
    strategy: ImmutablePropTypes.map.isRequired,
    resetModelConfig: PropTypes.func.isRequired,
    getStrategyUploadClasses: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
  };

  static defaultProps = {
    type: 'create',
  };

  constructor(props) {
    super(props);

    this.state = {
      isOpen: false,
    };

    this.titleHash = {
      edit: 'Edit Model',
      create: 'Create Model',
    };

    this.close = this.close.bind(this);
  }

  componentDidMount() {

  }

  show(openType = 'create') {
    const {dialog} = this.refs;
    this.props.getStrategyUploadClasses();
    dialog.show();

    this.setState({
      isOpen: true,
      type: openType,
    });
  }

  close() {
    const {dialog} = this.refs;
    const {resetModelConfig} = this.props;

    dialog.close();
    resetModelConfig();

    this.setState({
      isOpen: false,
    });
  }

  renderForm() {
    const {handleSubmit, strategy, model} = this.props;
    const isOpenFromModelDialog = model.get('openEditFromDialog');

    return (
      <div>
        {isOpenFromModelDialog &&
          <ModelEditDialogForm
            ref="form"
            onSubmit={handleSubmit}
            strategy={strategy}
          />
        }

        {isOpenFromModelDialog ||
          <DatatableRowModelEditForm
            ref="form"
            onSubmit={handleSubmit}
            strategy={strategy}
          />
        }
      </div>
    );
  }

  render() {
    const {isOpen, type} = this.state;
    const title = this.titleHash[type];

    return (
      <DialogBase
        ref="dialog"
        hasHeaderClose
        className="dialog-modeledit"
        title={title}
        zIndex={1010}
        onClose={this.close}
      >
        <div className="dialog-body">

          {/* 只有Dialog打開時再render form, 以避開reset()無法清除 dynamic fields的問題 */}
          {isOpen &&
            this.renderForm()
          }
        </div>
      </DialogBase>
    );
  }
}
