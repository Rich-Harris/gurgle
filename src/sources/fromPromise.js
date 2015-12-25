import stream from '../stream.js';

export default function fromPromise ( promise ) {
	let closed = false;
	const source = stream( () => closed = true );

	promise
		.then( value => !closed && source.push( value ) )
		.catch( err => !closed && source.error( err ) )
		.then( () => source.close() );

	return source;
}
