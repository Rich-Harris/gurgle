import stream from '../stream.js';

export default function filter ( source, fn ) {
	const destination = stream();

	source.subscribe(
		value => {
			if ( fn( value ) ) destination.push( value );
		},
		destination.error,
		destination.close
	);

	return destination;
}
