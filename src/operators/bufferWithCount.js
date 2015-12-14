import stream from '../stream.js';

export default function bufferWithCount ( source, count, skip = count ) {
	const destination = stream();

	let itemsUntilNewBuffer = 1;
	let buffers = [];

	source.subscribe( value => {
		if ( --itemsUntilNewBuffer === 0 ) {
			buffers.push([]);
			itemsUntilNewBuffer = skip;
		}

		buffers.forEach( buffer => buffer.push( value ) );
		if ( buffers[0].length === count ) destination.push( buffers.shift() );
	}, err => {
		destination.error( err );
	}, () => {
		buffers.forEach( buffer => destination.push( buffer ) );
		destination.close();
	});

	return destination;
}
