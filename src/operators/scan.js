import stream from '../stream.js';

export default function scan ( source, fn, acc ) {
	const destination = stream();

	destination.push( acc );

	source.subscribe(
		value => {
			acc = fn( destination.value, value );
			destination.push( acc );
		},
		destination.error,
		destination.close
	);

	return destination;
}
