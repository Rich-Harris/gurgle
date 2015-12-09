/* global require, describe, it */

var assert = require( 'assert' );
var gurgle = require( '../' );

describe( 'gurgle', function () {
	it( 'maps a stream', function () {
		var stream = gurgle.stream();
		var mapped = stream.pipe( gurgle.map, function ( value ) {
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
