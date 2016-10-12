export default function tap ( source, fn ) {
	source.subscribe( fn );
	return source;
}
