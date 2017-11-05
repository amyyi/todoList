import {fromJS, List} from 'immutable';
import {model as cons} from '../constants';
import ApiClient from 'helpers/ApiClient';

const apiClient = new ApiClient();

const initialState = fromJS({

  modelConfigLoading: false,
  modelConfigLoaded: false,
  modelConfigLoaderr: false,
  // modelConfig: defaultModelConfig,
  // modelConfig: [],

  openEditFromDialog: false,
});

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    // get model config
    case cons.LOAD_MODEL_CONFIG:
      return state.merge({
        modelConfigLoading: true,
        modelConfigLoaded: false,
        modelConfigLoaderr: false,
        modelConfigAtts: fromJS(action.atts),
      });

    case cons.LOAD_MODEL_CONFIG_SUCCESS: {

      // const _configs = modelConfigConverter('get', action.result);

      return state.merge({
        modelConfigLoading: false,
        modelConfigLoaded: true,
        modelConfigLoaderr: false,
        // modelConfig: fromJS(_configs),
        modelConfigAtts: fromJS(action.atts),
      });
    }

    case cons.LOAD_MODEL_CONFIG_FAIL:
      return state.merge({
        modelConfigLoading: false,
        modelConfigLoaded: false,
        modelConfigLoaderr: fromJS(action.error),
      });

    case cons.CHECK_OPEN_EDIT_FROM_DIALOG:
      return state.merge({
        openEditFromDialog: !state.get('openEditFromDialog'),
      });

    default:
      return state;
  }
}

export function switchEditFromDialog() {
  return {
    type: cons.CHECK_OPEN_EDIT_FROM_DIALOG,
    // type: [cons.HIDE_MODEL, cons.SHOW_MODEL],
  };
}

export function getModelConfig(id) {
  return {
    types: [cons.LOAD_MODEL_CONFIG, cons.LOAD_MODEL_CONFIG_SUCCESS, cons.LOAD_MODEL_CONFIG_FAIL],
    promises: (client) => client.get('/trader/desktop/models', {
      params: {
        title: title,
      },
    }),
    atts: {
      title: title,
    },
  };
}
