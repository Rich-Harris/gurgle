import stream from '../stream.js';

function getValue ( stream ) {
	return stream.value;
}

function isClosed ( stream ) {
	return stream.closed;
}

export default function combineLatest () {
	const numArguments = arguments.length;

	const lastArgument = arguments[ numArguments - 1 ];
	const fn = typeof lastArgument === 'function' && lastArgument;
	const end = fn ? numArguments - 1 : numArguments;

	let sources = [];
	for ( let i = 0; i < end; i += 1 ) {
		sources.push( arguments[i] );
	}

	const destination = stream();

	function push () {
		const values = sources.map( getValue );
		destination.push( fn ? fn.apply( null, values ) : values );
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
