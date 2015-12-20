import stream from '../stream.js';
import isClosed from '../helpers/isClosed.js';

export default function merge ( ...sources ) {
	const destination = stream();

	function push ( value ) {
		destination.push( value );
	}

	function error ( err ) {
		destination.error( err );
	}

	function close () {
		if ( sources.every( isClosed ) ) destination.close();
	}

	sources.forEach( source => {
		source.subscribe( push, error, close );
	});

	return destination;
}
