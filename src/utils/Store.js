import Freezer from 'freezer-js';

const Store = new Freezer({});
Store.initialize = (newState) => {
  let currentState = Store.get();

  Store.set({
    ...currentState,
    ...newState
  });
};
let storeHistory = [];

Store.on('history:undo', () => {
  if (storeHistory.length) {
    Store.get().reset(storeHistory[0]);
    storeHistory.shift();
  }
});

Store.on('history:add', () => {
  storeHistory.push(Store.get());
  if (storeHistory.length > 10) {
    storeHistory.pop();
  }
});

Store.on('history:reset', () => {
  if (storeHistory.length) {
    storeHistory = [];
  }
});

Store.setStoreState = (state) => {
  Store.get().reset(state);
};

export default Store;
