import React, {Component} from 'React';
import {cool} from 'react-freezer-js';
import Store from '../utils/Store';

class App extends Component {
  render() {
    return this.props.children;
  }
}

App.propTypes = {
  children: React.PropTypes.node
};

export default cool(App, Store);
