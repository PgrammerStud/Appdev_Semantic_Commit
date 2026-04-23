import { applyMiddleware, combineReducers, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';

import auth from '../reducers/auth';

// Config
const sagaMiddleware = createSagaMiddleware();

// Combine Reducers
const rootReducer = combineReducers({
  auth: auth,
});

export default () => {
  let store = createStore(rootReducer, applyMiddleware(sagaMiddleware));

  const runSaga = sagaMiddleware.run;

  return { store, runSaga };
};
