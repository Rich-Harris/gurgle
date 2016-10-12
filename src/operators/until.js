import stream from '../stream.js';

export default function until ( source, signal ) {
	const destination = stream();

	const sourceSubscriber = source.subscribe(
		value => {
			destination.push( value );
		},
		destination.error,
		destination.close
	);

	let initial = true;

	const signalSubscriber = signal.subscribe(
		() => {
			if ( initial ) return;

			sourceSubscriber.cancel();
			signalSubscriber.cancel();
			destination.close();
		},
		destination.error
	);

	initial = false;
	return destination;
}
