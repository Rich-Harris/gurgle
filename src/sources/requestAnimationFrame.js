import stream from '../stream.js';

export default function rAF () {
	const loop = value => {
		if ( !source.closed ) {
			source.push( value );
			requestAnimationFrame( loop );
		}
	};

	const source = stream();
	loop();

	return source;
}
