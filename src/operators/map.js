import stream from '../stream.js';

export default function map ( source, fn ) {
	const destination = stream();

	source.subscribe(
		value => {
			destination.push( fn( value ) );
		},
		destination.error,
		destination.close
	);

	return destination;
}
