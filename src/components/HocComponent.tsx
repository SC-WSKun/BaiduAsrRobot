import React, {Component} from 'react';
import {WsContext} from '../context';

export default (WrappedComponent: any) => {
  class NewComponent extends Component {
    render() {
      return (
        <WsContext.Consumer>
          {context => {
            return <WrappedComponent {...this.props} {...context} />;
          }}
        </WsContext.Consumer>
      );
    }
  }
  return NewComponent;
};
