import stream from '../stream.js';
import isClosed from '../helpers/isClosed.js';

export default function merge ( ...sources ) {
	const destination = stream();

	function close () {
		if ( sources.every( isClosed ) ) destination.close();
	}

	sources.forEach( source => {
		source.subscribe(
			value => {
				destination.push( value );
			},
			destination.error,
			close
		);
	});

	return destination;
}
