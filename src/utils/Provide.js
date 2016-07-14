import React from 'react';
import {warmUp} from 'react-freezer-js';

/*=============================================================================
	Given a component and prop paths, give the component props from the store

	Prop paths must be an array of strings, with each string corresponding to
	a key on the store. For example

	Provide(<Application />, ['application_loading']);

	This will provide the <Application /> component with the prop
	'application_loading'. When the 'application_loading' key in the store
	is changed, the <Application /> component will automatically re-render.
=============================================================================*/

export default function Provide(ComponentToBeProvided, requestedProps) {
	/*=============================================================================
		Convert the requested props in to an array of arrays that warmUp needs.
	=============================================================================*/
  const decoratedProps = requestedProps.map((prop) => {
    return [prop, prop];
  });

	const ProvidedComponent = React.createClass({
		render() {
			return <ComponentToBeProvided {...this.props} />;
		}
	});

  return warmUp(ProvidedComponent, decoratedProps);
}
