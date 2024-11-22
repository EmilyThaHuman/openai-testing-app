export class StateUtils {
  static createSelector(selector, equalityFn = (a, b) => a === b) {
    let lastResult;
    let lastState;

    return state => {
      if (state === lastState) {
        return lastResult;
      }

      const nextResult = selector(state);
      if (equalityFn(nextResult, lastResult)) {
        return lastResult;
      }

      lastState = state;
      lastResult = nextResult;
      return nextResult;
    };
  }

  static batch(updates) {
    return state => {
      return updates.reduce((nextState, update) => update(nextState), state);
    };
  }

  static createAsyncReducer(actionTypes) {
    return (state, action) => {
      switch (action.type) {
        case actionTypes.request:
          return { ...state, loading: true, error: null };
        case actionTypes.success:
          return { ...state, loading: false, data: action.payload };
        case actionTypes.failure:
          return { ...state, loading: false, error: action.payload };
        default:
          return state;
      }
    };
  }
}
