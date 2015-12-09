import { stream } from '../gurgle.js';

export default function map ( source, fn ) {
	const destination = stream();
	source.subscribe( value => {
		destination.push( fn( value ) );
	});

	return destination;
}
