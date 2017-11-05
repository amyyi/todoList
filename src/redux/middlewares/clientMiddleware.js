import {auth} from '../constants';

export default function clientMiddleware(apiClient, waterfall) {
  return ({dispatch, getState}) => {
    return next => action => {

      if (typeof action === 'function') {
        return action(dispatch, getState);
      }

      const {promises, promiseType, types, ...rest} = action;
      let finalPromise = null;

      if (!promises) {
        return next(action);
      }

      switch (promiseType) {
        case 'all':
          finalPromise = Promise.all(promises.map((promiseObj) => {
            return promiseObj(apiClient);
          }));
          break;

        case 'race':
          finalPromise = Promise.race(promises.map((promiseObj) => {
            return promiseObj(apiClient);
          }));
          break;

        case 'waterfall':
          finalPromise = waterfall(promises.map((promiseObj) => {
            return (res = null) => {
              return promiseObj(apiClient, res);
            };
          }));
          break;

        default:
          finalPromise = promises(apiClient);
          break;
      }

      const [REQUEST, SUCCESS, FAILURE] = types;

      if (REQUEST) {
        next({...rest, type: REQUEST});
      }

      return finalPromise.then(
        (result) => {
          next({...rest, result, type: SUCCESS});
        },
        (error) => {
          if (error.status === 401) {
            next({...rest, error, type: auth.ISLOGIN_FAIL});
          }
          next({...rest, error, type: FAILURE});
        }
      ).catch((error)=> {
        console.error('MIDDLEWARE ERROR:', error);
        next({...rest, error, type: FAILURE});
      });
    };
  };
}
