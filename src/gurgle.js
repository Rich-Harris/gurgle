const noop = () => {};

function Stream () {
	this.subscribers = [];
}

Stream.prototype = {
	pipe ( fn, ...args ) {
		return fn( this, ...args );
	},

	push ( value ) {
		this.value = value;

		this.subscribers.forEach( ({ onvalue }) => {
			onvalue( value );
		});
	},

	subscribe ( onvalue, onerror = noop, oncomplete = noop ) {
		this.subscribers.push({ onvalue, onerror, oncomplete });
	}
}


export function stream () {
	return new Stream();
}

export { default as debounce } from './operators/debounce.js';
export { default as distinctUntilChanged } from './operators/distinctUntilChanged.js';
export { default as filter } from './operators/filter.js';
export { default as flatMap } from './operators/flatMap.js';
export { default as flatMapLatest } from './operators/flatMapLatest.js';
export { default as map } from './operators/map.js';

export { fromEvent } from './sources/dom.js';
export { default as fromPromise } from './sources/promise.js';
