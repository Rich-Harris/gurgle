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
		const success = position => {
			if ( closed ) return;

			stream.push( position );
			setTimeout( check, interval );
		};

		const error = error => {
			stream.error( error );
			setTimeout( check, interval );
		};

		const check = () => {
			if ( closed ) return;
			navigator.geolocation.getCurrentPosition( success, error, options );
		};

		check();
	} else {
		watchId = navigator.geolocation.watchPosition( source.push, source.error, options );
	}

	return source;
}
