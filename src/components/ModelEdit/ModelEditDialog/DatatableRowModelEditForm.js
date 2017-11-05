import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import {is} from 'immutable';
import {reduxForm, addArrayValue} from 'redux-form';
import Select from 'react-select';

import {isModelNameAcceptable} from 'redux/modules/model';
import validation from './validation';
import {createAsyncValidatorStatusChecker} from 'utils/validation';

import {
  FormGroup,
  FormInputRadio,
  FormInputText,
  FormInputTimeRange,
  IconLoading,
} from 'components';

@reduxForm({
  form: 'modelEditDialog',
  fields: [
    'id',
    'modelName',
    'file',
    'fileClass',
    'closingOffset',
    'contractPrimary.name',
    'contractPrimary.value',
    'contracts[].name',
    'contracts[].value',
    'timePrimary',
    'times[]',
    'maxPositionPerSide',
    'maxOrderQuantity',
    'minOrderQuantity',
    'maxOrdersPerSide',
    'maxCrossTicks',
    'subsequentOrderDelay',
    'minCancelDelay',
    'customConfigs[].name',
    'customConfigs[].type',
    'customConfigs[].value',
  ],
  asyncValidate: isModelNameAcceptable,
  asyncBlurFields: ['modelName'],
  validate: validation,
},
(state) => { // mapStateToProps
  /*
    https://github.com/erikras/redux-form/issues/628
    第二次呼叫時,無法清除deep fields & 塞入新值
  */
  return {
    initialValues: state.model.get('modelConfig').toJS(),
  };
}, { // mapDispatchToProps
  addValue: addArrayValue,
})

export default class DatatableRowModelEditForm extends Component {

  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    strategy: ImmutablePropTypes.map.isRequired,
    addValue: PropTypes.func.isRequired,
    resetForm: PropTypes.func.isRequired,
    asyncValidating: PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.bool,
    ]).isRequired,
    fields: PropTypes.object.isRequired,
    invalid: PropTypes.bool.isRequired,
    submitting: PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      fileClasses: [],
    };

    this.inlineStyleHash = {
      modelName: {
        width: 268,
      },
      file: {
        width: 324,
      },
      fileClass: {
        width: 314,
      },
      closingOffset: {
        width: 155,
      },
      maxPositionPerSide: {
        width: 155,
      },
      maxOrderQuantity: {
        width: 161,
      },
      minOrderQuantity: {
        width: 163,
      },
      maxOrdersPerSide: {
        width: 163,
      },
      maxCrossTicks: {
        width: 187,
      },
      subsequentOrderDelay: {
        width: 134,
      },
      minCancelDelay: {
        width: 178,
      },
      customConfig: {
        name: {
          width: 200,
        },
        type: {
          width: 200,
          marginLeft: 6,
        },
        value: {
          width: 200,
        },
      },
    };
    this.customConfigTypeOptions = [{
      label: 'Integer',
      value: 'Integer',
    }, {
      label: 'Double',
      value: 'Double',
    }, {
      label: 'String',
      value: 'String',
    }, {
      label: 'Boolean',
      value: 'Boolean',
    }];
    this.inputTypeHash = {
      'Integer': 'integer',
      'Double': 'float',
    };
    this.modelNameAsyncChecker = createAsyncValidatorStatusChecker('modelName');
    this._handleFileSelectOnChange = this._handleFileSelectOnChange.bind(this);
    this._handleClassSelectOnChange = this._handleClassSelectOnChange.bind(this);
    this._handleAddContractOnClick = this._handleAddContractOnClick.bind(this);
    this._handleDeleteFieldOnClick = this._handleDeleteFieldOnClick.bind(this);
    this._handleAddConfigOnClick = this._handleAddConfigOnClick.bind(this);
    this._handleAddTimeOnClick = this._handleAddTimeOnClick.bind(this);
    this._handleSubmit = this._handleSubmit.bind(this);
  }

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps) {
    const {
      fields: {
        file,
      },
      strategy,
    } = this.props;
    const {strategy: nextStrategy} = nextProps;

    // 初始化 File 與 Class Select
    if (!is(strategy.get('uploadClasses'), nextStrategy.get('uploadClasses'))) {
      const uploadClasses = nextStrategy.get('uploadClasses').toJS();

      if (uploadClasses.length > 0 && file.value) {
        uploadClasses.forEach((obj) => {
          if (obj.value === file.value) {
            this.setState({
              fileClasses: obj.classes,
            });
          }
        });
      }
    }
  }

  _handleFileSelectOnChange(optionObj) {
    const {fields} = this.props;
    const {value, classes} = optionObj;

    fields.file.onChange(value);
    fields.fileClass.onChange('');

    this.setState({
      fileClasses: classes,
    });
  }

  _handleClassSelectOnChange(optionObj) {
    const {fields} = this.props;
    const {value} = optionObj;
    fields.fileClass.onChange(value);
  }

  _handleCustomConfigTypeSelectOnChange(optionObj, index) {
    const {fields} = this.props;
    const {value} = optionObj;
    const customConfig = fields.customConfigs[index];
    customConfig.type.onChange(value);
    customConfig.value.onChange('');
  }

  _handleAddContractOnClick(e) {
    e.preventDefault();

    const {
      fields: {
        contracts,
      },
    } = this.props;
    contracts.addField();
  }

  _handleAddConfigOnClick(e) {
    e.preventDefault();

    const {
      fields: {
        customConfigs,
      },
    } = this.props;

    customConfigs.addField({
      type: 'Integer',
    });
  }

  _handleAddTimeOnClick(e) {
    e.preventDefault();

    const {
      fields: {
        times,
      },
    } = this.props;
    times.addField('00:00:00-01:00:00');
  }

  _handleDeleteFieldOnClick(e, fieldName, index) {
    e.preventDefault();

    const {fields} = this.props;
    fields[fieldName].removeField(index);
  }


  _handleSubmit() {
    const {handleSubmit} = this.props;
    return handleSubmit();
  }

  renderCustomConfigValue(customConfig, index) {
    const {inputTypeHash} = this;
    const type = customConfig.type.value;
    const valueTitle = customConfig.name.value;

    if (type === 'Boolean') {
      return (
        <div className="form-group">

          <label className="form-input-title required">{valueTitle}</label>

          <div className="form-radio-inline">
            <FormInputRadio
              id={`modelEditDialogForm_customConfig_${index}_true`}
              name={customConfig.value.name}
              label="True"
              value="true"
              checked={customConfig.value.value === 'true' || !customConfig.value.value}
              onChange={customConfig.value.onChange}
            />
          </div>

          <div className="form-radio-inline">
            <FormInputRadio
              id={`modelEditDialogForm_customConfig_${index}_false`}
              name={customConfig.value.name}
              label="False"
              value="false"
              checked={customConfig.value.value === 'false'}
              onChange={customConfig.value.onChange}
            />
          </div>
        </div>
      );
    }

    return (
      <FormGroup className="display-table" touched error={customConfig.value.error}>
        <div className="display-table-cell">
          <label className="form-input-title required">{valueTitle}</label>
        </div>

        <div className="display-table-cell">
          <FormInputText
            className="form-input"
            type={inputTypeHash[type]}
            placeholder={`Input ${type}`}
            value={customConfig.value.value}
            onChange={customConfig.value.onChange}
            onBlur={customConfig.value.onBlur}
          />
        </div>
      </FormGroup>
    );
  }

  render() {
    const {inlineStyleHash} = this;
    const {
      invalid,
      asyncValidating,
      submitting,
      fields: {
        id,
        modelName,
        file,
        fileClass,
        closingOffset,
        contractPrimary,
        contracts,
        timePrimary,
        times,
        maxPositionPerSide,
        maxOrderQuantity,
        minOrderQuantity,
        maxOrdersPerSide,
        maxCrossTicks,
        subsequentOrderDelay,
        minCancelDelay,
        customConfigs,
      },
      strategy,
    } = this.props;

    const fileSelectPlaceholder = strategy.get('uploadClassesLoad') ? 'Loading...' : 'Select a file';
    const classSelectPlaceholder = file.value ? 'Select a class' : 'Please select file first';

    return (
      <div>
        <form>
          <input className="from-input" type="hidden" {...id} />

          <FormGroup>
            <label className="form-input-title">Model Name</label>
            <input
              className="form-input"
              style={inlineStyleHash.modelName}
              type="text"
              placeholder="Input the model name"
              value={modelName.value}
              disabled="disabled"
            />
          </FormGroup>

          <FormGroup>
            <label className="form-input-title">File</label>
            <input
              className="form-input"
              style={inlineStyleHash.file}
              type="text"
              placeholder={fileSelectPlaceholder}
              value={file.value}
              disabled="disabled"
            />
          </FormGroup>

          <FormGroup>
            <label className="form-input-title">Class</label>
            <input
              className="form-input"
              style={inlineStyleHash.fileClass}
              type="text"
              placeholder={classSelectPlaceholder}
              value={fileClass.value}
              disabled="disabled"
            />
          </FormGroup>

          <p className="form-block-title">
            Contract
          </p>

          <FormGroup>
            <label className="form-input-title">Name</label>
            <input
              className="form-input"
              style={inlineStyleHash.customConfig.name}
              type="text"
              placeholder="Input the contract name"
              value={contractPrimary.name.value}
              disabled="disabled"
            />
          </FormGroup>

          <FormGroup>
            <label className="form-input-title">Value</label>
            <input
              className="form-input"
              style={inlineStyleHash.customConfig.value}
              type="text"
              placeholder="Input the contract value"
              value={contractPrimary.value.value}
              disabled="disabled"
            />
          </FormGroup>


          {contracts.map((contract, i) => {
            return (
              <div key={`modelEditDialogForm_contract_${i}`}>
                <p className="form-block-title">
                  Contract {i + 2}

                </p>

                <FormGroup>
                  <label className="form-input-title">Name</label>
                  <input
                    className="form-input"
                    style={inlineStyleHash.customConfig.name}
                    type="text"
                    placeholder="Input the contract name"
                    value={contract.name.value}
                    disabled="disabled"
                  />
                </FormGroup>

                <FormGroup>
                  <label className="form-input-title">Value</label>
                  <input
                    className="form-input"
                    style={inlineStyleHash.customConfig.value}
                    type="text"
                    placeholder="Input the contract name"
                    value={contract.value.value}
                    disabled="disabled"
                  />
                </FormGroup>
              </div>
            );
          })}

          <p className="form-block-title">
            Default Config
          </p>

          <FormGroup touched={closingOffset.touched} error={closingOffset.error}>
            <label className="form-input-title required">Closing Off Set</label>
            <FormInputText
              className="form-input"
              style={inlineStyleHash.closingOffset}
              type="integer"
              onlyPositive
              placeholder="Input number"
              maxLength={3}
              value={closingOffset.value}
              onChange={closingOffset.onChange}
              onBlur={closingOffset.onBlur}
            />
          </FormGroup>

          <FormGroup touched={timePrimary.touched} error={timePrimary.error}>
            <label className="form-input-title required">Time</label>
            <FormInputTimeRange value={timePrimary.value} onChange={timePrimary.onChange} onBlur={timePrimary.onBlur} />
          </FormGroup>

          {times.map((time, i) => {
            return (
              <FormGroup key={`modelEditDialogForm_time_${i}`} touched error={time.error}>
                <label className="form-input-title required">Time {i + 2}</label>
                <FormInputTimeRange value={time.value} onChange={time.onChange} onBlur={time.onBlur} />
              </FormGroup>
            );
          })}

          <FormGroup touched={maxPositionPerSide.touched} error={maxPositionPerSide.error}>
            <label className="form-input-title">Condition.maxPositionPerSide</label>
            <FormInputText
              className="form-input"
              style={inlineStyleHash.maxPositionPerSide}
              type="integer"
              onlyPositive
              placeholder="Input number"
              maxLength={3}
              value={maxPositionPerSide.value}
              onChange={maxPositionPerSide.onChange}
              onBlur={maxPositionPerSide.onBlur}
            />
          </FormGroup>

          <FormGroup touched={maxOrderQuantity.touched} error={maxOrderQuantity.error}>
            <label className="form-input-title required">Condition.maxOrderQuantity</label>
            <FormInputText
              className="form-input"
              style={inlineStyleHash.maxOrderQuantity}
              type="integer"
              onlyPositive
              placeholder="Input number"
              maxLength={3}
              value={maxOrderQuantity.value}
              onChange={maxOrderQuantity.onChange}
              onBlur={maxOrderQuantity.onBlur}
            />
          </FormGroup>

          <FormGroup touched={minOrderQuantity.touched} error={minOrderQuantity.error}>
            <label className="form-input-title">Condition.minOrderQuantity</label>
            <FormInputText
              className="form-input"
              style={inlineStyleHash.minOrderQuantity}
              type="integer"
              onlyPositive
              placeholder="Input number"
              maxLength={3}
              value={minOrderQuantity.value}
              onChange={minOrderQuantity.onChange}
              onBlur={minOrderQuantity.onBlur}
            />
          </FormGroup>

          <FormGroup touched={maxOrdersPerSide.touched} error={maxOrdersPerSide.error}>
            <label className="form-input-title required">Condition.maxOrdersPerSide</label>
            <FormInputText
              className="form-input"
              style={inlineStyleHash.maxOrdersPerSide}
              type="integer"
              onlyPositive
              placeholder="Input number"
              maxLength={3}
              value={maxOrdersPerSide.value}
              onChange={maxOrdersPerSide.onChange}
              onBlur={maxOrdersPerSide.onBlur}
            />
          </FormGroup>

          <FormGroup touched={maxCrossTicks.touched} error={maxCrossTicks.error}>
            <label className="form-input-title">Condition.maxCrossTicks</label>
            <FormInputText
              className="form-input"
              style={inlineStyleHash.maxCrossTicks}
              type="integer"
              onlyPositive
              placeholder="Input number"
              maxLength={3}
              value={maxCrossTicks.value}
              onChange={maxCrossTicks.onChange}
              onBlur={maxCrossTicks.onBlur}
            />
          </FormGroup>

          <FormGroup touched={subsequentOrderDelay.touched} error={subsequentOrderDelay.error}>
            <label className="form-input-title">Condition.subsequentOrderDelay</label>
            <FormInputText
              className="form-input"
              style={inlineStyleHash.subsequentOrderDelay}
              type="integer"
              onlyPositive
              placeholder="Input number"
              maxLength={3}
              value={subsequentOrderDelay.value}
              onChange={subsequentOrderDelay.onChange}
              onBlur={subsequentOrderDelay.onBlur}
            />
          </FormGroup>

          <FormGroup touched={minCancelDelay.touched} error={minCancelDelay.error}>
            <label className="form-input-title">Condition.minCancelDelay</label>
            <FormInputText
              className="form-input"
              style={inlineStyleHash.minCancelDelay}
              type="integer"
              onlyPositive
              placeholder="Input number"
              maxLength={3}
              value={minCancelDelay.value}
              onChange={minCancelDelay.onChange}
              onBlur={minCancelDelay.onBlur}
            />
          </FormGroup>

          <p className="form-block-title">
            Custom Config
          </p>

          {customConfigs.map((customConfig, i) => {
            return (
              <div key={`modelEditDialogForm_customConfig_${i}`}>
                <div className="edit-dialog-config">
                  {this.renderCustomConfigValue(customConfig, i)}
                </div>

              </div>
            );
          })}

          <div className="dialog-footer">
            <button
              className="btn btn-primary"
              type="button"
              disabled={invalid || !!asyncValidating || submitting}
              onClick={this._handleSubmit}
            >
              Save
              <IconLoading isKeepAlive isLoading={!!asyncValidating || submitting} />
            </button>
          </div>

        </form>


      </div>


    );
  }
}
