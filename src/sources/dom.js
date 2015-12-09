import { stream } from '../gurgle.js';

export function fromEvent ( node, type ) {
	const source = stream();
	node.addEventListener( type, event => source.push( event ), false );

	return source;
}
