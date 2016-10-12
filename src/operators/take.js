import stream from '../stream.js';

export default function take ( source, count ) {
	const destination = stream();

	source.subscribe(
		value => {
			if ( destination.closed ) return;

			destination.push( value );
			count -= 1;

			if ( count === 0 ) destination.close();
		},

		destination.error,
		destination.close
	);

	return destination;
}
