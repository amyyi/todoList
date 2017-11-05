export const DEFAULT_HTTP_STATUS_MSG_HASH = {
  UNKNOWN: {
    status: 0,
    errorCode: '',
    errorMsg: 'UNKNOWN_ERROR',
  },
  ACCOUNT_ALREADY_ACTIVE: {
    status: 304,
    errorCode: '',
    errorMsg: 'ACCOUNT_ALREADY_ACTIVE',
  },
  INVALID_PARAM: {
    status: 400,
    errorCode: '',
    errorMsg: 'INVALID_PARAM',
  },
  ACCOUNT_NOT_LOGIN: {
    status: 401,
    errorCode: '',
    errorMsg: 'ACCOUNT_NOT_LOGIN',
  },
  UNAUTHORIZED_ACCESS: {
    status: 403,
    errorCode: '',
    errorMsg: 'UNAUTHORIZED_ACCESS',
  },
  DATA_NOT_FOUND: {
    status: 404,
    errorCode: '',
    errorMsg: 'DATA_NOT_FOUND',
  },
  ACCOUNT_EXISTS: {
    status: 422,
    errorCode: '',
    errorMsg: 'ACCOUNT_EXISTS',
  },
  GENERIC_ERROR: {
    status: 500,
    errorCode: '',
    errorMsg: 'GENERIC_ERROR',
  },
};
