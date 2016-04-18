/* global require, describe, it */

const assert = require( 'assert' );
const g = require( '../' );

describe( 'gurgle', () => {
	describe( 'stream', () => {
		it( 'calls a callback on close', () => {
			let closed = false;
			const stream = g.stream( () => closed = true );
			stream.close();
			assert.ok( closed );
		});

		describe( 'push', () => {
			it( 'updates stream.value', () => {
				const stream = g.stream();

				stream.push( 'a' );
				assert.equal( stream.value, 'a' );
				stream.close();
			});

			it( 'is chainable', () => {
				const stream = g.stream();

				stream.push( 'a' ).push( 'b' );
				assert.equal( stream.value, 'b' );
				stream.close();
			});
		});

		describe( 'close', () => {
			it( 'closes a stream', () => {
				const stream = g.stream();

				assert.ok( !stream.closed );
				stream.close();
				assert.ok( stream.closed );

				assert.throws( function () {
					stream.push( 'x' );
				}, /Cannot push to a closed stream/ );
			});
		});

		describe( 'subscribe', () => {
			it( 'subscribes to a stream', () => {
				const stream = g.stream();

				let value, error, closed;

				stream.subscribe(
					v => value = v,
					e => error = e,
					() => closed = true
				);

				stream.push( 42 );
				stream.error( new Error( 'oh noes!' ) );
				stream.close();

				assert.equal( value, 42 );
				assert.equal( error.message, 'oh noes!' );
				assert.ok( closed );
			});

			it( 'returns an object with a `cancel` method', () => {
				const stream = g.stream();

				let value, error, closed;

				const subscriber = stream.subscribe(
					v => value = v,
					e => error = e,
					() => closed = true
				);

				stream.push( 42 );
				stream.error( new Error( 'oh noes!' ) );

				subscriber.cancel();

				stream.push( 99 );
				stream.error( new Error( 'nope' ) );
				stream.close();

				assert.equal( value, 42 );
				assert.equal( error.message, 'oh noes!' );
				assert.ok( !closed );
			});
		});
	});

	describe( 'sources', () => {
		describe( 'fromEvent', () => {
			it( 'creates a stream of DOM events', () => {
				const fakeDomNode = {
					listeners: {},
					addEventListener: ( type, listener ) => {
						( fakeDomNode.listeners[ type ] || ( fakeDomNode.listeners[ type ] = [] ) ).push( listener );
					},
					removeEventListener: ( type, listener ) => {
						const group = fakeDomNode.listeners[ type ];
						if ( !group ) return;
						const index = group.indexOf( listener );
						if ( ~index ) group.splice( index, 1 );
					},
					trigger: ( type, event ) => {
						const group = fakeDomNode.listeners[ type ];
						if ( !group ) return;
						group.forEach( fn => fn( event ) );
					}
				};

				const stream = g.fromEvent( fakeDomNode, 'mousemove' );
				stream.subscribe( event => {
					assert.equal( event.type, 'mousemove' );
					assert.equal( event.clientX, 1 );
				});

				fakeDomNode.trigger( 'mousemove', { type: 'mousemove', clientX: 1 });
				stream.close();
				fakeDomNode.trigger( 'mousemove', { type: 'mousemove', clientX: 2 });
				assert.equal( fakeDomNode.listeners.mousemove.length, 0 );
			});
		});

		describe( 'fromPromise', () => {
			it( 'creates a stream from a promise', () => {
				let fulfil;
				const promise = new Promise( f => fulfil = f );
				const stream = g.fromPromise( promise );

				let value;
				stream.subscribe( v => value = v );

				fulfil( 42 );

				return stream.done.then( () => {
					assert.equal( value, 42 );
				});
			});

			it( 'handles rejections', () => {
				let reject;
				const promise = new Promise( ( f, r ) => reject = r );
				const stream = g.fromPromise( promise );

				let err;
				stream.subscribe( () => {}, e => err = e );

				reject( new Error( 'something went wrong' ) );

				return stream.done.then( () => {
					assert.equal( err.message, 'something went wrong' );
				});
			});

			it( 'ignores resolutions after the stream is closed', () => {
				let fulfil;
				const promise = new Promise( f => fulfil = f );
				const stream = g.fromPromise( promise );

				let value;
				stream.subscribe( v => value = v );

				stream.close();
				fulfil( 42 );

				return promise.then( () => {
					assert.equal( value, undefined );
				});
			});
		});
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
				a.push( 'y' ).push( 'z' );
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

				source.push( 'a' ).push( 'b' ).push( 'c' ).close();

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

				source
					.push( 1 )
					.push( 2 )
					.push( 3 )
					.push( 3 )
					.push( 2 )
					.push( 3 )
					.push( 2 )
					.push( 2 )
					.push( 1 )
					.push( 1 )
					.push( 1 )
					.push( 4 )
					.close();

				assert.deepEqual( results, [ 1, 2, 3, 2, 3, 2, 1, 4 ]);
			});
		});

		describe( 'filter', () => {
			it( 'filters out values', () => {
				const source = g.stream();
				const dest = g.filter( source, x => x % 2 );

				let results = [];
				dest.subscribe( value => results.push( value ) );

				source
					.push( 1 )
					.push( 2 )
					.push( 3 )
					.push( 4 )
					.push( 5 )
					.push( 6 )
					.push( 7 )
					.push( 8 )
					.push( 9 )
					.close();

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
