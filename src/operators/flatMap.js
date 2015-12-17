import stream from '../stream.js';

export default function flatMap ( source, streamGenerator ) {
	const destination = stream();

	source.subscribe( value => {
		const next = streamGenerator( value );
		next.subscribe( value => destination.push( value ) );
	}, err => {
		destination.error( err );
	}, () => {
		// TODO should this stay open until all generated streams have closed? presumably
		destination.close();
	});

	return destination;
}
