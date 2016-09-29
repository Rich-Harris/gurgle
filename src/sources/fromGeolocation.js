import stream from '../stream.js';

export default function fromGeolocation ( options = {} ) {
	const interval = options.interval;
	let closed = false;
	let watchId;

	const source = stream( () => {
		if ( interval ) {
			closed = true;
		} else {
			navigator.geolocation.clearWatch( watchId );
		}
	});

	if ( interval ) {
		const onsuccess = position => {
			if ( closed ) return;

			source.push( position );
			setTimeout( check, interval );
		};

		const onerror = error => {
			if ( options.onerror ) {
				options.onerror( error );
				setTimeout( check, interval );
			} else {
				source.error( error );
			}
		};

		const check = () => {
			if ( closed ) return;
			navigator.geolocation.getCurrentPosition( onsuccess, onerror, options );
		};

		check();
	} else {
		const onerror = error => {
			if ( options.onerror ) {
				options.onerror( error );
			} else {
				source.error( error );
			}
		};

		watchId = navigator.geolocation.watchPosition( source.push, onerror, options );
	}

	return source;
}
