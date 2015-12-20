/* global require, describe, it */

import * as assert from 'assert';
import * as g from '../';

describe( 'gurgle', () => {
	describe( 'sources', () => {
		// TODO
	});

	describe( 'operators', () => {
		describe( 'bufferWithCount', () => {
			it( 'chunks input stream up into buffers of the specified size', () => {
				const source = g.stream();
				const dest = g.bufferWithCount( source, 3 );

				let results = [];
				dest.subscribe( value => results.push( value ) );

				for ( let i = 0; i < 9; i += 1 ) {
					source.push( i );
				}

				source.close();
				assert.deepEqual( results, [
					[ 0, 1, 2 ],
					[ 3, 4, 5 ],
					[ 6, 7, 8 ]
				]);
			});

			it( 'chunks input stream up into buffers of the specified size and with a specified offset', () => {
				const source = g.stream();
				const dest = g.bufferWithCount( source, 3, 1 );

				let results = [];
				dest.subscribe( value => results.push( value ) );

				for ( let i = 0; i < 9; i += 1 ) {
					source.push( i );
				}

				source.close();
				assert.deepEqual( results, [
					[ 0, 1, 2 ],
					[ 1, 2, 3 ],
					[ 2, 3, 4 ],
					[ 3, 4, 5 ],
					[ 4, 5, 6 ],
					[ 5, 6, 7 ],
					[ 6, 7, 8 ],
					[ 7, 8 ],
					[ 8 ]
				]);
			});
		});

		describe( 'combineLatest', () => {
			it( 'combines latest values', () => {
				const a = g.stream();
				const b = g.stream();

				const combined = a.pipe( g.combineLatest, b, ( a, b ) => a + b );

				a.push( 'x' );
				b.push( 1 );

				let results = [];
				combined.subscribe( value => results.push( value ) );

				b.push( 2 );
				a.push( 'y', 'z' );
				b.push( 3 );

				a.close();
				b.close();

				assert.deepEqual( results, [ 'x2', 'y2', 'z2', 'z3' ]);
			});
		});

		describe( 'debounce', () => {
			it( 'waits until specified period of inactivity', () => {
				const source = g.stream();
				const dest = g.debounce( source, 1 );

				let results = [];
				dest.subscribe( value => results.push( value ) );

				source.push( 'a', 'b', 'c' ).close();

				dest.done.then( () => {
					assert.deepEqual( results, [ 'c' ]);
				});
			});
		});

		describe( 'distinctUntilChanged', () => {
			it( 'ignores values that are identical to the previous one', () => {
				const source = g.stream();
				const dest = g.distinctUntilChanged( source );

				let results = [];
				dest.subscribe( value => results.push( value ) );

				source.push( 1, 2, 3, 3, 2, 3, 2, 2, 1, 1, 1, 4 ).close();

				assert.deepEqual( results, [ 1, 2, 3, 2, 3, 2, 1, 4 ]);
			});
		});

		describe( 'filter', () => {
			it( 'filters out values', () => {
				const source = g.stream();
				const dest = g.filter( source, x => x % 2 );

				let results = [];
				dest.subscribe( value => results.push( value ) );

				source.push( 1, 2, 3, 4, 5, 6, 7, 8, 9 ).close();

				assert.deepEqual( results, [ 1, 3, 5, 7, 9 ]);
			});
		});

		describe( 'flatMap', () => {
			it( 'flattens a stream of streams into a single stream', () => {
				const input = g.stream();

				let temp = [];
				const output = g.flatMap( input, value => {
					const stream = g.stream();
					temp.push({ stream, value });

					return stream;
				});

				let results = [];
				output.subscribe( value => results.push( value ) );

				input.push( 'a' );
				temp[0].stream.push( temp[0].value.toUpperCase() );

				input.push( 'b' );
				input.push( 'c' );
				temp[2].stream.push( temp[2].value.toUpperCase() ); // out of order
				temp[1].stream.push( temp[1].value.toUpperCase() );

				input.close();

				return output.done.then( () => {
					assert.deepEqual( results, [ 'A', 'C', 'B' ] );
				});
			});
		});

		describe( 'flatMapLatest', () => {
			it( 'ignores responses that arrive after later requests', () => {
				let temp = [];

				const input = g.stream();
				const output = input.pipe( g.flatMapLatest, value => {
					const stream = g.stream();
					temp.push({ stream, value });

					return stream;
				});

				let results = [];
				output.subscribe( value => results.push( value ) );

				input.push( 'a' );
				temp[0].stream.push( temp[0].value.toUpperCase() );

				input.push( 'b' );
				input.push( 'c' );
				temp[2].stream.push( temp[2].value.toUpperCase() ); // out of order
				temp[1].stream.push( temp[1].value.toUpperCase() );

				input.close();

				return output.done.then( () => {
					assert.deepEqual( results, [ 'A', 'C' ] );
				});
			});
		});

		describe( 'map', () => {
			it( 'maps a stream', () => {
				const stream = g.stream();
				const mapped = stream.pipe( g.map, x => x * x );

				let results = [];
				mapped.subscribe( value => results.push( value ) );

				stream.push( 1 );
				stream.push( 2 );
				stream.push( 3 );

				stream.close();

				assert.deepEqual( results, [ 1, 4, 9 ]);
			});
		});

		describe( 'merge', () => {
			it( 'merges streams', () => {
				const a = g.stream();
				const b = g.stream();

				const merged = g.merge( a, b );

				a.push( 1 );
				assert.equal( merged.value, 1 );

				b.push( 2 );
				assert.equal( merged.value, 2 );

				a.push( 3 );
				assert.equal( merged.value, 3 );

				a.close();
				b.close();
			});

			it( 'closes the merged stream when all inputs are closed', () => {
				const a = g.stream();
				const b = g.stream();

				const merged = g.merge( a, b );
				assert.ok( !merged.closed );

				a.close();
				assert.ok( !merged.closed );

				b.close();
				assert.ok( merged.closed );
			});
		});

		describe( 'scan', () => {
			it( 'accumulates values', () => {
				const input = g.stream();
				const output = input.pipe( g.scan, ( prev, next ) => prev + next, 0 );

				assert.equal( output.value, 0 );

				input.push( 1 );
				assert.equal( output.value, 1 );

				input.push( 2 );
				assert.equal( output.value, 3 );

				input.push( 3 );
				assert.equal( output.value, 6 );

				input.close();
			});
		});

		describe( 'throttle', () => {
			it( 'throttles a stream', () => {
				const input = g.stream();
				const output = g.throttle( input, 10 );

				input.push( 1 );
				input.push( 2 );
				input.push( 3 );
				assert.equal( output.value, 1 );

				setTimeout( () => {
					assert.equal( output.value, 1 );
					input.push( 4 );
					assert.equal( output.value, 4 );

					input.close();
				}, 20 );

				return output.done;
			});
		});
	});
});
