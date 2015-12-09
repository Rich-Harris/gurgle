import { stream } from '../gurgle.js';

export default function debounce ( source, ms = 250 ) {
	const destination = stream();

	let latestValue;
	let timeout;

	source.subscribe( value => {
		latestValue = value;
		clearTimeout( timeout );

		timeout = setTimeout( () => {
			destination.push( latestValue );
		}, ms );
	});

	return destination;
}
