import stream from '../stream.js';

export default function fromAjax ( url, options = {} ) {
	let closed = false;
	const source = stream( () => closed = true );

	const xhr = new XMLHttpRequest();
	xhr.open( options.method || 'GET', url );

	xhr.responseType = options.responseType || 'text';

	xhr.onerror = source.error;

	xhr.onload = () => {
		if ( closed ) return;

		source.push( xhr.response );
		source.close();
	};

	xhr.send();

	return source;
}
