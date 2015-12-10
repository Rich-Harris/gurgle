import stream from '../stream.js';

export default function combineLatest ( a, b, fn ) {
	const destination = stream();

	function push () {
		destination.push( fn( a.value, b.value ) );
	}

	function error ( err ) {
		destination.error( err );
	}

	function close () {
		if ( a.closed && b.closed ) destination.close();
	}

	a.subscribe( push, error, close );
	b.subscribe( push, error, close );

	return destination;
}
