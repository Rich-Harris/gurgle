import stream from '../stream.js';

export default function filter ( source, fn ) {
	const destination = stream();

	source.subscribe( value => {
		if ( fn( value ) ) destination.push( value );
	}, err => {
		destination.error( err );
	}, () => {
		destination.close();
	});

	return destination;
}
