import Freezer from 'freezer-js';

class Store extends Freezer {
  constructor(state) {
    super(state);
  }

  initialize(newState) {
    this.historyState = [];
    this.redoState = [];
    let currentState = this.get();

    this.set({
      ...currentState,
      ...newState
    });
  }

  setStoreState(state) {
    this.get().reset(state);
  }

  addHistoryEntry() {
    this.historyState.unshift(this.get());
  }

  undo() {
    if (this.historyState.length) {
      this.redoState.unshift(this.get());
      this.get().reset(this.historyState[0]);
      this.historyState.shift();
    }
  }

  redo() {
    if (this.redoState.length) {
      this.historyState.unshift(this.get());
      this.get().reset(this.redoState[0]);
      this.redoState.shift();
    }
  }
}

export default new Store({});
