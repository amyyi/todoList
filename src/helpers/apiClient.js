import ie from 'component-ie';
import superagent from 'superagent';

const METHODS = ['get', 'post', 'put', 'patch', 'del'];

const errNoResponse = {
  errorCode: 0,
  errorMsg: 'No response from server'
};
const errWrongResponse = {
  errorCode: 0,
  errorMsg: 'Wrong response format from server'
};

function errorFormater(err, body) {

  if (!err) {
    return null;
  } else if (err && !body) {
    return errNoResponse;
  } else if (!err && !body) {
    return errWrongResponse;
  }
  return {
    errorCode: body.errorCode,
    errorMsg: body.errorMsg
  };
}

function formatUrl(path) {
  const adjustedPath = path[0] !== '/' ? '/' + path : path;

  if (__ENV__ === 'test') {
    return adjustedPath;
  }

  if (__MOCK_API_IS_USE__) {
    return `${__MOCK_API_HOST__}:${__MOCK_API_PORT__}${adjustedPath}`;
  }
  return `${__SERVER_URL__}${adjustedPath}`;
}

/*
  loop all obj props and set empty stirng if value is null or undefined,
  because "superagent" doesn't send params whose value is null or undefined,
  ex:
    param = {id: undefined, name: 'hank'} -> ?name=hank

  but we want:
    param = {id: undefined, name: 'hank'} -> ?id=&name=hank
*/
function emptyStringSetter(obj = {}) {
  return Object.keys(obj).reduce((prev, curr) => {
    prev[curr] = obj[curr] || '';
    return prev;
  }, {});
}

class ApiClient {
  constructor(httpclient = superagent) {

    METHODS.forEach((method) =>
      this[method] = (path, {params = {}, files, data, progressCallback, endCallback} = {}) => new Promise((resolve, reject) => {

        const request = httpclient[method](formatUrl(path));
        const _progressCallback = typeof progressCallback === 'function' ? progressCallback : () => {};
        const resolveFunc = (body) => resolve(body);


        if (ie && ie <= 10 && method === 'get') {
          params.timestamp = new Date().getTime();
        }

        /*
        if (!__MOCK_API_IS_USE__) {
          // 沒有這行，cross domain拿到的cookie不會set, 只有不使用useMockApi才加上
          request.withCredentials();
        }
        */

        request.query(emptyStringSetter(params));

        // upload files
        if (Array.isArray(files) && files.length > 0) {
          files.forEach((file) => {
            request.attach(file.name, file);
          });
          request.on('progress', (e) => {
            _progressCallback(e.percent);
          });

          if (data && typeof data === 'object') {
            Object.keys(data).forEach((key) => {
              request.field(key, data[key]);
            });
          }
        } else if (data) {
          request.type('application/json');
          request.send(data);
        }

        request.end((err, {body} = {}) => {
          const _err = errorFormater(err, body);

          if (endCallback && typeof endCallback === 'function') {
            return endCallback(_err, body, resolve, reject);
          }
          return _err ? reject(_err) : resolveFunc(body);

        });

      }));
  }
}

export default ApiClient;

// import superagent from 'superagent';

// const ApiClient = store => next => action => {
//   /*
//   Pass all actions through by default
//   */
//   next(action)
//   switch (action.type) {
//   case 'GET_TODO_DATA':
//     /*
//     In case we receive an action to send an API request, send the appropriate request
//     */
//     request
//       .get('./todo.json')
//       .end((err, res) => {
//         if (err) {
//           /*
//           in case there is any error, dispatch an action containing the error
//           */
//           return next({
//             type: 'GET_TODO_DATA_ERROR',
//             err
//           })
//         }
//         const data = JSON.parse(res.text)
//         /*
//         Once data is received, dispatch an action telling the application
//         that data was received successfully, along with the parsed data
//         */
//         next({
//           type: 'GET_TODO_DATA_RECEIVED',
//           data
//         })
//       })
//     break
//   /*
//   Do nothing if the action does not interest us
//   */
//   default:
//     break
//   }

// };

// export default ApiClient;