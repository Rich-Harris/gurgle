import { stream } from '../gurgle.js';

export default function flatMap ( source, streamGenerator ) {
	const destination = stream();

	let token = 0;

	source.subscribe( value => {
		token += 1;
		console.log( 'token', token, value )

		const t = token;
		const next = streamGenerator( value );

		next.subscribe( value => {
			console.log( 'value', value )
			if ( t === token ) destination.push( value );
		});
	}, err => {
		destination.error( err );
	}, () => {
		destination.close();
	});

	return destination;
}
