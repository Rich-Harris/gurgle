import stream from '../stream.js';

export default function pairwise ( source ) {
	const destination = stream();

	let last = null;
	let hasStarted = false;

	source.subscribe(
		value => {
			if ( hasStarted ) destination.push( [ last, value ] );
			hasStarted = true;

			last = value;
		},
		destination.error,
		destination.close
	);

	return destination;
}
