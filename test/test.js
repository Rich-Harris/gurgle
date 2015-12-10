/* global require, describe, it */

import * as assert from 'assert';
import * as g from '../';
import wait from './utils/wait.js';

describe( 'gurgle', () => {
	describe( 'sources', () => {
		// TODO
	});

	describe( 'operators', function () {
		describe( 'map', function () {
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

				assert.deepEqual( results, [ 1, 4, 9 ]);
			});
		});

		describe( 'flatMapLatest', () => {
			it.only( 'does what you would expect TK', () => {
				const promise1 = Promise.resolve( 'a' );
				const promise2 = wait( 150 ).then( () => 'b' );
				const promise3 = wait( 100 ).then( () => 'c' );

				const input = g.stream();
				const output = input.pipe( g.flatMapLatest, promise => {
					return g.fromPromise( promise.then( value => value.toUpperCase() ) );
				});

				let results = [];
				output.subscribe( value => {
					console.log( 'RECEIVED', value )
					results.push( value );
				});

				console.log( 'pushing 1' )
				input.push( promise1 );
				wait( 150 ).then( () => console.log( 'pushing 2' ), input.push( promise2 ) );
				wait( 200 ).then( () => console.log( 'pushing 3' ), input.push( promise3 ) );

				Promise.all([ promise1, promise2, promise3 ]).then( () => {
					input.close();
				});

				return output.done.then( () => {
					assert.deepEqual( results, [ 'A', 'C' ] );
				});
			});
		});
	});


});
