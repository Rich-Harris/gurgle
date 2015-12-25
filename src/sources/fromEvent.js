import stream from '../stream.js';

export default function fromEvent ( node, type ) {
	const source = stream( () => {
		node.removeEventListener( type, source.push, false );
	});

	node.addEventListener( type, source.push, false );

	return source;
}
