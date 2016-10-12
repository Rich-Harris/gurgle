import stream from '../stream.js';

export default function delay ( source, ms ) {
	const destination = stream();

	source.subscribe(
		value => {
			setTimeout( () => {
				if ( !destination.closed ) destination.push( value );
			}, ms );
		},
		destination.error,
		() => setTimeout( destination.close, ms )
	);

	return destination;
}
