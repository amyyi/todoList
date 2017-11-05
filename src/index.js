import 'babel-polyfill';

/*
Use the following to override the addEventListener and
removeEventListener methods on all EventTargets
with replacements that support an options object if necessary
*/
import 'event-listener-with-options/js/polyfill';

// Polyfill for creating CustomEvents on IE9/10/11 if native implementation is missing.
import 'custom-event-polyfill/custom-event-polyfill';
//import 'utils/debug'; // init debug obj in window object

import React from 'react';
import ReactDOM from 'react-dom';
import Perf from 'react-addons-perf';
import {Provider} from 'react-redux';
import {Router, useRouterHistory} from 'react-router';
import {syncHistoryWithStore} from 'react-router-redux';
import {createHashHistory} from 'history';
import {trigger} from 'redial';

import createStore from './redux/createStore';
import routes from './routes';

// 套件的css
import 'malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.css';
import 'jquery-ui/themes/base/all.css';
import 'react-select/dist/react-select.min.css';

//套件font-awesome
import 'style/font/font-awesome/css/font-awesome.min.css'; 

// 切板完成後的css放在這
import 'style/css/bundle.css';



const hashHistory = useRouterHistory(createHashHistory)({});

// default的redux state
const initialState = {};
const store = createStore(hashHistory, initialState);
const history = syncHistoryWithStore(hashHistory, store);
const {dispatch, getState} = store;

function onRouterUpdate() {
  const {components, location, params} = this.state;
  const locals = {
    location,
    params,
    dispatch,
    getState,
  };

  trigger('fetch', components, locals)
    .then(components.render);
}

// Performace Tools, 不是很會用, 先放著
if (__DEVELOPMENT__) {
  window.Perf = Perf;
}

ReactDOM.render(
  <Provider store={store}>
    <Router history={history} onUpdate={onRouterUpdate}>{routes}</Router>
  </Provider>
  , document.getElementById('main')
);
