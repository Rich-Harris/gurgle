import stream from '../stream.js';

export default function flatMap ( source, streamGenerator ) {
	const destination = stream();

	let latest = 0;

	source.subscribe( value => {
		latest += 1;

		const token = latest;
		const next = streamGenerator( value );

		next.subscribe( value => {
			if ( token === latest ) destination.push( value );
		});
	}, err => {
		destination.error( err );
	}, () => {
		destination.close();
	});

	return destination;
}
