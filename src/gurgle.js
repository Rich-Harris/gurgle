const noop = () => {};

export function stream () {
	let subscribers = [];

	let fulfil;
	let reject;

	const done = new Promise( ( f, r ) => {
		fulfil = f;
		reject = r;
	});

	const s = {
		close () {
			fulfil( s.value );

			subscribers.forEach( subscriber => {
				subscriber.onclose();
			});
		},

		done,

		error ( err ) {
			reject( err );

			subscribers.forEach( subscriber => {
				subscriber.onerror();
			});
		},

		pipe ( fn, ...args ) {
			return fn( s, ...args );
		},

		push ( value ) {
			s.value = value;

			subscribers.forEach( subscriber => {
				subscriber.onvalue( value );
			});
		},

		subscribe ( onvalue, onerror = noop, onclose = noop ) {
			subscribers.push({ onvalue, onerror, onclose });
		},

		value: undefined
	};

	return s;
}

export { default as debounce } from './operators/debounce.js';
export { default as distinctUntilChanged } from './operators/distinctUntilChanged.js';
export { default as filter } from './operators/filter.js';
export { default as flatMap } from './operators/flatMap.js';
export { default as flatMapLatest } from './operators/flatMapLatest.js';
export { default as map } from './operators/map.js';

export { fromEvent } from './sources/dom.js';
export { default as fromPromise } from './sources/promise.js';
