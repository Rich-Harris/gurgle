/* global require, describe, it */

import * as assert from 'assert';
import * as g from '../';
import wait from './utils/wait.js';

describe( 'gurgle', () => {
	describe( 'sources', () => {
		// TODO
	});

	describe( 'operators', function () {
		describe( 'combineLatest', () => {
			it( 'combines latest values', () => {
				var a = g.stream();
				var b = g.stream();

				var combined = a.pipe( g.combineLatest, b, ( a, b ) => a + b );

				a.push( 'x' );
				b.push( 1 );

				let results = [];
				combined.subscribe( value => results.push( value ) );

				b.push( 2 );
				a.push( 'y' );
				a.push( 'z' );
				b.push( 3 );

				a.close();
				b.close();

				assert.deepEqual( results, [ 'x2', 'y2', 'z2', 'z3' ]);
			});
		});

		describe( 'map', () => {
			it( 'maps a stream', function () {
				var stream = g.stream();
				var mapped = stream.pipe( g.map, function ( value ) {
					return value * value;
				});

				var results = [];
				mapped.subscribe( function ( value ) {
					results.push( value );
				});

				stream.push( 1 );
				stream.push( 2 );
				stream.push( 3 );

				stream.close();

				assert.deepEqual( results, [ 1, 4, 9 ]);
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
	});


});
