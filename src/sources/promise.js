import stream from '../stream.js';

export default function fromPromise ( promise ) {
	const source = stream();
	promise
		.then( value => source.push( value ) )
		.catch( err => source.error( err ) )
		.then( () => source.close() );

	return source;
}
