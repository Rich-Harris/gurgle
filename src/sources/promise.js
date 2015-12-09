import { stream } from '../gurgle.js';

export default function fromPromise ( promise ) {
	const source = stream();
	promise.then( value => source.push( value ) );

	return source;
}
