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
