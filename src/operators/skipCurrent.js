import stream from '../stream.js';

export default function skipCurrent ( source ) {
	if ( !source.started ) return source;

	const destination = stream();
	let started = false;

	source.subscribe(
		value => {
			if ( started ) destination.push( value );
		},
		destination.error,
		destination.close
	);

	started = true;
	return destination;
}
