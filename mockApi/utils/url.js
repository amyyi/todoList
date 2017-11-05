export function mapUrl(availableActions = {}, url = []) {

  const notFound = {action: null, params: []};

  // test for empty input
  if (url.length === 0 || Object.keys(availableActions).length === 0) {
    return notFound;
  }
  /*eslint-disable */
  const reducer = (next, current) => {

    if (next.action && next.action[current]) {
      return {action: next.action[current], params: [], current: current}; // go deeper
    } else {
      if (typeof next.action === 'function') {
        return {action: next.action, params: next.params.concat(current), current: current}; // params are found
      } else {
        return notFound;
      }
    }
  };
  /*eslint-enable */

  const actionAndParams = url.reduce(reducer, {action: availableActions, params: [], current: ''});

  if (typeof actionAndParams.action === 'function') {
    return actionAndParams;
  }

  if (typeof actionAndParams.action[actionAndParams.current] === 'function') {
    actionAndParams.action = actionAndParams.action[actionAndParams.current];
    return actionAndParams;
  }
  return notFound;
}
