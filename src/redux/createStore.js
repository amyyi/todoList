import {createStore as _createStore, applyMiddleware, compose} from 'redux';
import {routerMiddleware} from 'react-router-redux';
import waterfall from 'promise-waterfall';
import clientMiddleware from './middlewares/clientMiddleware';
import ApiClient from 'helpers/ApiClient';
import reducer from './modules/reducer';

export default function createStore(history, initialState) {
  const middleware = [
    routerMiddleware(history),
    clientMiddleware(new ApiClient(), waterfall)
  ];

  let finalCreateStore;

  if (__DEVELOPMENT__) {
    finalCreateStore = compose(
      applyMiddleware(...middleware),
      window.devToolsExtension ? window.devToolsExtension() : f => f,
    )(_createStore);

  } else {
    finalCreateStore = compose(
      applyMiddleware(...middleware),
    )(_createStore);
  }

  const store = finalCreateStore(reducer, initialState);

  return store;
}
