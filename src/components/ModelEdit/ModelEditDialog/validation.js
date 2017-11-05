import {
  createValidator,
  integer,
  number,
  nonZeroStart,
  required,
  maxLength,
} from 'utils/validation';
import {timeRangeNormalizer, isDateOverlap} from 'utils/datetime';

const contractDuplicationChecker = (value, data, index) => {
  const contractPrimary = data.contractPrimary;
  const msg = 'The contract name must be unique';

  // 是contracts child 時，先跟 contractPrimary 比對
  if (typeof index !== 'undefined' && value === contractPrimary.name) {
    return msg;
  }

  // contractPrimary or contracts child 跟其他 child 做比對
  const result = data.contracts.every((contract, i) => {
    if (i === index) {
      return true;
    }

    if (contract.name === value) {
      return false;
    }
    return true;
  });
  return !result && msg;
};

const customConfigValueRulesCreater = (value, data, index) => {
  const config = data.customConfigs[index];

  if (config.type === 'Integer') {
    return integer(value, data) || nonZeroStart(value, data);
  } else if (config.type === 'Double') {
    return number(value, data) || nonZeroStart(value, data);
  }
};

const customConfigDuplicationChecker = (value, data, index) => {
  const currentConfig = data.customConfigs[index];
  const result = data.customConfigs.every((config, i) => {
    if (i === index) {
      return true;
    }

    if (config.name === currentConfig.name && config.type === currentConfig.type) {
      return false;
    }
    return true;
  });
  return !result && 'Config name + type must be unique';
};

const timeEqualChecker = (value = '') => {
  if (!value) {
    return false;
  }

  const msg = 'Start & end time should not be equal';
  const _value = timeRangeNormalizer(value).split('-');

  return _value[0] === _value[1] && msg;
};

export const timeOverlapChecker = (() => {
  const timeFormatter = (value = '') => {
    if (!value) {
      return false;
    }

    const _value = timeRangeNormalizer(value).split('-');

    // 將時間轉換成秒數加總
    const _valueBySec = _value.map((time) => {
      return time.split(':').reduce((previous, current, index) => {
        let _current = +current;

        if (index === 0) { // hour
          _current = _current * 60 * 60;
        } else if (index === 1) { // minute
          _current = _current * 60;
        }
        return previous + _current;
      }, 0);
    });
    const defaultBeginDate = 13;
    const defaultEndDate = _valueBySec[0] > _valueBySec[1] ? defaultBeginDate + 1 : defaultBeginDate;

    return [
      new Date(`October ${defaultBeginDate}, 2014 ${_value[0]}`),
      new Date(`October ${defaultEndDate}, 2014 ${_value[1]}`),
    ];
  };

  return (value, data, index) => {
    // 沒值就不要驗證
    if (!value) {
      return false;
    }
    const _timePrimary = timeFormatter(data.timePrimary);
    const _value = timeFormatter(value);
    const msg = 'The time must not overlap';

    // 是times child 時，先跟 timePrimary 比對
    if (typeof index !== 'undefined' && isDateOverlap(_timePrimary, _value)) {
      return msg;
    }

    const result = data.times.every((time, i) => {
      if (i === index || !time) {
        return true;
      }

      const _time = timeFormatter(time);

      if (isDateOverlap(_time, _value)) {
        return false;
      }
      return true;
    });
    return !result && msg;
  };
})();

const validation = createValidator({
  modelName: [required, maxLength(32)],
  file: [required],
  fileClass: [required],
  contractPrimary: {
    name: [required, maxLength(32), contractDuplicationChecker],
    value: [required, maxLength(16)],
  },
  contracts: {
    name: [required, maxLength(32), contractDuplicationChecker],
    value: [required, maxLength(16)],
  },
  timePrimary: [timeEqualChecker, timeOverlapChecker],
  times: [timeEqualChecker, timeOverlapChecker],
  closingOffset: [required, nonZeroStart],
  maxPositionPerSide: nonZeroStart,
  maxOrderQuantity: [required, nonZeroStart],
  minOrderQuantity: nonZeroStart,
  maxOrdersPerSide: [required, nonZeroStart],
  maxCrossTicks: nonZeroStart,
  subsequentOrderDelay: nonZeroStart,
  minCancelDelay: nonZeroStart,
  customConfigs: {
    name: [required, maxLength(32), customConfigDuplicationChecker],
    type: [customConfigDuplicationChecker],
    value: [required, customConfigValueRulesCreater],
  },
});

export default validation;
