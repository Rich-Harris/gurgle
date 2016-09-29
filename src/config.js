let P = typeof Promise !== 'undefined' ? Promise : null;

export { P as Promise };

export function usePromise ( Promise ) {
	P = Promise;
}
