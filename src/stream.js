import { Promise } from './config.js';

const noop = () => {};

export default function stream () {
	let subscribers = [];

	let fulfil;
	let reject;

	const done = new Promise( ( f, r ) => {
		fulfil = f;
		reject = r;
	});

	const s = {
		// properties
		closed: false,
		done,
		value: undefined,

		// methods
		close () {
			if ( s.closed ) return;
			s.closed = true;

			fulfil( s.value );

			subscribers.forEach( subscriber => {
				subscriber.onclose();
			});
		},

		debug ( label = 'gurgle' ) {
			label = `[${label}]`;

			return s.subscribe( value => {
				console.log( label, value );
			}, err => {
				console.error( label, err );
			}, () => {
				console.log( label, 'closed stream' );
			});
		},

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
			const len = arguments.length;
			if ( len > 1 ) {
				for ( let i = 0; i < len; i += 1 ) {
					s.push( arguments[i] );
				}

				return s;
			}

			const previousValue = s.value;
			s.value = value;

			subscribers.forEach( subscriber => {
				subscriber.onvalue( value, previousValue );
			});

			return s;
		},

		subscribe ( onvalue, onerror = noop, onclose = noop ) {
			subscribers.push({ onvalue, onerror, onclose });
		}
	};

	return s;
}
