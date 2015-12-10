import stream from '../stream.js';

export default function scan ( source, fn, acc ) {
	const destination = stream();

	destination.push( acc );

	source.subscribe( value => {
		acc = fn( destination.value, value );
		destination.push( acc );
	}, err => {
		destination.error( err );
	}, () => {
		destination.close();
	});

	return destination;
}
