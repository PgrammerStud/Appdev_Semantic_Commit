import configureStore from './reducers/index';
import rootSaga from './sagas/index';

const { store, runSaga } = configureStore();

runSaga(rootSaga);

export { store };
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;