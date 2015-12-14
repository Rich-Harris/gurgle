import stream from '../stream.js';

export default function merge ( ...sources ) {
	const destination = stream();

	sources.forEach( source => {
		source.subscribe( value => {
			destination.push( value );
		}, err => {
			destination.error( err );
		}, () => {
			destination.close();
		});
	});

	return destination;
}
