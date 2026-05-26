import { applyMiddleware, combineReducers, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import cartReducer from './cart';

import auth from '../reducers/auth';

// Config
const sagaMiddleware = createSagaMiddleware();

// Combine Reducers
const rootReducer = combineReducers({
  auth: auth,
  cart: cartReducer,
});

export default () => {
  let store = createStore(rootReducer, applyMiddleware(sagaMiddleware));

  const runSaga = sagaMiddleware.run;

  return { store, runSaga };
};
