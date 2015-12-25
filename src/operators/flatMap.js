import stream from '../stream.js';

export default function flatMap ( source, streamGenerator ) {
	const destination = stream();

	source.subscribe(
		value => {
			const next = streamGenerator( value );
			next.subscribe( value => destination.push( value ) );
		},
		destination.error,
		destination.close // TODO should this stay open until all generated streams have closed? presumably
	);

	return destination;
}
