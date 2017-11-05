import React from 'react';
import {Route, Redirect} from 'react-router';
import App from './containers/App';
import TodoList from './containers/TodoList';

const routes = (
  <Route component={App}>
  
    <Route component={App}>
      <Route path="/" component={TodoList} />
    </Route>
   
    <Redirect from="*" to="/" />

  </Route>
);

export default routes;
