import {combineReducers} from 'redux';
import {routerReducer} from 'react-router-redux';
import {reducer as form} from 'redux-form';

import todo from './todo';
import model from './model';
import error from './error';

export default combineReducers({
  form,
  todo,
  model,
  error,
  routing: routerReducer,
});
