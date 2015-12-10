import stream from '../stream.js';

export default function scan ( source, fn, acc ) {
	const destination = stream();

	source.subscribe( value => {
		acc = fn( acc, value );
		destination.push( acc );
	}, err => {
		destination.error( err );
	}, () => {
		destination.close();
	});

	return destination;
}
