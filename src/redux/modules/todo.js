import { fromJS, List } from 'immutable';
import { todo as cons } from '../constants';

const initialState = fromJS({
  load: false,
  loadSuc: false,
  loadErr: false,
  add: false,
  addSuc: false,
  addErr: false,
  todos: [],
});

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case cons.LOAD:
      return state.merge({
        load: true,
        loadSuc: false,
        loadErr: false,
        todos: List(),
      });
    case cons.LOAD_SUCCESS:
      return state.merge({
        load: false,
        loadSuc: true,
        loadErr: false,
        todos: fromJS(action.result),
      });
    case cons.LOAD_FAIL:
      return state.merge({
        load: false,
        loadSuc: false,
        loadErr: fromJS(action.error),
        todos: List(),
      });

    // add todo
    case cons.ADD_TODO: {
      const { newTodos } = action.atts;
      const todos = state.get('todos');
      return state.merge({
        add: true,
        addSuc: false,
        addErr: false,
        addAtts: fromJS(action.atts),
        todos: newTodos,
      });
    }
    case cons.ADD_TODO_SUCCESS: {
      const { newTodos } = action.atts;
      const todos = state.get('todos');
      return state.merge({
        add: false,
        addSuc: true,
        addErr: false,
        todos: newTodos,
      });
    }
    case cons.ADD_TODO_FAIL:
      return state.merge({
        addAdding: false,
        addSuc: false,
        addErr: fromJS(action.error),
      });
    default:
      return state;
  }
}

export function getTodo() {
  return {
    types: [cons.LOAD, cons.LOAD_SUCCESS, cons.LOAD_FAIL],
    promises: (client) => client.get('/trader/desktop/todos')
  };
}

export function addTodo(newTodos) {
  return {
    types: [cons.ADD_TODO, cons.ADD_TODO_SUCCESS, cons.ADD_TODO_FAIL],
    promises: (client) => client.post('/trader/desktop/todos', {
      data: { newTodos: newTodos },
    }),
    atts: {
      newTodos: newTodos,

    },
  };
}


