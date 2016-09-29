import stream from '../stream.js';

export default function flatMap ( source, streamGenerator ) {
	const destination = stream();

	let childSources = [];
	let closed = false;

	source.subscribe(
		value => {
			const child = streamGenerator( value );
			childSources.push( child );

			child.subscribe(
				value => {
					if ( !closed ) destination.push( value );
				},
				destination.error,
				() => {
					const index = childSources.indexOf( child );
					if ( ~index ) childSources.splice( index, 1 );
				}
			);
		},
		destination.error,
		() => {
			closed = true;

			childSources.forEach( child => child.close() );
			childSources = [];

			destination.close();
		}
	);

	return destination;
}
