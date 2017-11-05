import {fromJS} from 'immutable';

const initialState = fromJS({
  error: null
});

export default function reducer(state = initialState, action = {}) {

  switch (action.type) {
    default:

      if (action.error) {

        return state.merge({
          error: fromJS(action.error)
        });
      }
      return state;
  }
}

