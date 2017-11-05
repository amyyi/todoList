const isEmpty = value => value === undefined || value === null || value === '';
const ruleBuilder = (rules, value, data, index) => {
  // 如果欄位沒有驗證規則，直接通過
  if (!rules) {
    return '';
  }

  return rules.map((rule) => {
    if (Array.isArray(value)) {
      return value.map((valueChild, i) => {
        return ruleBuilder(rules, valueChild, data, i);
      });
    } else if (value && typeof value === 'object') {
      const error = {};
      Object.keys(value).forEach((key) => {
        error[key] = ruleBuilder(rule[key], value[key], data, index);
      });
      return error;
    }
    return rule(value, data, index);
  }).filter(error => !!error)[0]; // first error
};

export function joinRules(rules) {
  return (value, data) => {
    return ruleBuilder(rules, value, data);
  };
}

export function email(value) {
  // Let's not start a debate on email regex. This is just for an example app!
  if (!isEmpty(value) && !/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/i.test(value)) {
    return 'Please enter a valid email address.';
  }
}

export function url(value) {
  if (!isEmpty(value) && !/^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value)) {
    return 'Please enter a valid URL.';
  }
}

export function required(value) {
  if (isEmpty(value)) {
    return 'This field is required.';
  }
}

export function minLength(min, unit = 'character') {
  const _unit = min > 1 ? `${unit}s` : unit;

  return value => {
    if (!isEmpty(value) && value.length < min) {
      return `Please enter at least ${min} ${_unit}.`;
    }
  };
}

export function maxLength(max, unit = 'character') {
  const _unit = max > 1 ? `${unit}s` : unit;

  return value => {
    if (!isEmpty(value) && value.length > max) {
      return `Please enter no more than ${max} ${_unit}.`;
    }
  };
}

export function number(value) {
  if (!/^-?(?:(?:0|[1-9][0-9]*)(?:\.[0-9]+)?|\.[0-9]+)$/.test(value)) {
    return 'Please enter a valid numbers.';
  }
}

export function nonZeroStart(value = '') {
  let _value = value ? value.toString() : '';

  if (_value.indexOf('-') === 0) {
    _value = _value.slice(1);
  }

  if (!/(?:^0$)|(?:^$)|(?:^0\.)|(?:^[^0].*$)/.test(_value)) {
    return 'First number can\'t be 0';
  }
}

export function integer(value) {
  if (!/^-?\d+$/.test(value)) {
    return 'Please enter a valid integers.';
  }
}

export function oneOf(enumeration) {
  return value => {
    if (!~enumeration.indexOf(value)) {
      return `Must be one of: ${enumeration.join(', ')}`;
    }
  };
}

export function match(field, msg) {
  return (value, data) => {
    if (data) {
      if (value !== data[field]) {
        return msg || `Do not match field ${field}`;
      }
    }
  };
}

export function password(value) {
  if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[\w\W]{8,32}$/.test(value)) {
    return 'Please enter a valid password.';
  }
}

export function createValidator(rules) {
  return (data = {}) => {
    const errors = {};
    Object.keys(rules).forEach((key) => {
      const rule = joinRules([].concat(rules[key])); // concat enables both functions and arrays of functions
      const error = rule(data[key], data);

      if (error) {
        errors[key] = error;
      }
    });
    return errors;
  };
}

export function createAsyncValidatorStatusChecker(key) {
  let isAsyncCheckedBefore = false;

  return (asyncValidating, valid) => {
    if (!valid) {
      isAsyncCheckedBefore = false;
      return '';
    }

    if (asyncValidating === key || asyncValidating && isAsyncCheckedBefore) {
      isAsyncCheckedBefore = true;
      return 'loading';
    }

    if (!asyncValidating && isAsyncCheckedBefore && valid) {
      isAsyncCheckedBefore = false;
      return 'success';
    }
    return '';
  };
}
