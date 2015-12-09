import { stream } from '../gurgle.js';

export default function flatMap ( source, generator ) {
	const destination = stream();

	source.subscribe( value => {
		const next = generator( value );
		next.subscribe( value => destination.push( value ) );
	});

	return destination;
}
