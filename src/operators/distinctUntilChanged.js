import { stream } from '../gurgle.js';

export default function distinctUntilChanged ( source ) {
	const destination = stream();

	let latestValue;

	source.subscribe( value => {
		if ( value === latestValue ) return;
		latestValue = value;

		destination.push( value );
	}, err => {
		destination.error( err );
	}, () => {
		destination.close();
	});

	return destination;
}
