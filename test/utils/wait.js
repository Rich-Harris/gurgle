export default function wait ( ms ) {
	return new Promise( fulfil => {
		setTimeout( fulfil, ms );
	});
}
