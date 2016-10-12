import stream from '../stream.js';

export default function of ( value ) {
	const source = stream().push( value );
	source.close();

	return source;
}
