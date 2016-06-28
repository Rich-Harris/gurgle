import stream from '../stream.js';

export default function fromGeolocation ( options ) {
	const source = stream( () => {
		navigator.geolocation.clearWatch( id );
	});

	const id = navigator.geolocation.watchPosition( source.push, source.error, options );

	return source;
}
