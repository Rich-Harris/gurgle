import { Promise } from './config.js';

const noop = () => {};

export default function stream ( onclose = noop ) {
	let subscribers = [];

	// `stream.done` resolves once the stream is closed.
	// Handy for testing etc
	let fulfil;
	let reject;

	let errored = false;
	let error = null;

	const done = new Promise( ( f, r ) => {
		fulfil = f;
		reject = r;
	});

	const s = {
		__gurgle: true,

		// properties
		closed: false,
		done,
		started: false,
		value: undefined,

		// methods
		close () {
			if ( s.closed ) return;

			onclose();

			Object.defineProperty( s, 'closed', {
				value: true,
				writable: false,
				enumerable: true
			});

			if ( errored ) {
				reject( error );
			} else {
				fulfil( s.value );
			}

			subscribers.forEach( subscriber => {
				if ( subscriber.onclose ) subscriber.onclose();
			});

			subscribers = null;
		},

		debug ( label = 'gurgle' ) {
			label = `[${label}]`;

			return s.subscribe( value => {
				console.log( label, value ); // eslint-disable-line no-console
			}, err => {
				console.error( label, err ); // eslint-disable-line no-console
			}, () => {
				console.log( label, 'closed stream' ); // eslint-disable-line no-console
			});
		},

		error ( err ) {
			let caught = false;
			subscribers.forEach( subscriber => {
				if ( subscriber.onerror ) {
					caught = true;
					subscriber.onerror( err );
				}
			});

			error = err;
			s.close();

			if ( !caught ) throw err;
		},

		pipe ( fn, ...args ) {
			return fn( s, ...args );
		},

		push ( value ) {
			if ( s.closed ) throw new Error( 'Cannot push to a closed stream' );

			const previousValue = s.value;
			s.value = value;

			subscribers.forEach( subscriber => {
				subscriber.onvalue( value, previousValue );
			});

			s.started = true;

			return s;
		},

		subscribe ( onvalue, onerror, onclose ) {
			const callbacks = { onvalue, onerror, onclose };

			if ( errored ) {
				if ( onerror ) onerror( error );
			} else {
				if ( s.started ) onvalue( s.value );

				if ( s.closed ) {
					if ( onclose ) onclose();
				} else {
					subscribers.push( callbacks );
				}
			}

			return {
				cancel () {
					console.log( `CANCEL`, onvalue )
					if ( s.closed ) return;
					const index = subscribers.indexOf( callbacks );
					if ( ~index ) subscribers.splice( index, 1 );
				}
			};
		}
	};

	return s;
}
