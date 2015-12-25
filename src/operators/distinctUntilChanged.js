import stream from '../stream.js';

export default function distinctUntilChanged ( source ) {
	const destination = stream();

	let latestValue;

	source.subscribe(
		value => {
			if ( value === latestValue ) return;
			latestValue = value;

			destination.push( value );
		},
		destination.error,
		destination.close
	);

	return destination;
}
