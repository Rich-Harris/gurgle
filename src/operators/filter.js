import { stream } from '../gurgle.js';

export default function filter ( source, fn ) {
	const destination = stream();
	source.subscribe( value => {
		if ( fn( value ) ) destination.push( value );
	});

	return destination;
}
