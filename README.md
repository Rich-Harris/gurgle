# Gurgle

Like [RxJS](https://github.com/Reactive-Extensions/RxJS/), but for normal people.


## Really? Why?

The Reactive Extensions for JavaScript, or RxJS, give us a new way to think about how data flows through your application. Rather than gaffer taping your application together with listeners that respond to discrete *events*, Rx allows us to think about *streams* of values. The power of this approach becomes obvious when you manipulate and combine streams – throttling keypresses in a search field and discarding obsolete AJAX responses, for example.

On a recent project, I decided to use RxJS to avoid what would otherwise have quickly become a spaghetti mess of imperative code. But I'm not used to thinking in streams, and found myself fighting the library at every turn. The Reactive mantra that **anything can be stream** (from this [excellent introduction](https://gist.github.com/staltz/868e7e9bc2a7b8c1f754)) soon gave way to **everything must be a stream**. Figuring out how to use Reactive concepts alongside more familiar techniques was beyond me in the limited time I had available before my deadline.

So I did the only sensible thing and wrote my own library, with the following goals:

* **tiny** – if you're using a modern module bundler such as Rollup or Webpack 2, any unused operators will be discarded. Like a tightly-optimised custom build, except with zero configuration
* **readable** – you should be able to read the source code and understand exactly what is going on
* **easy** – ideological purity may be sacrificed in the name of getting stuff done
* **familiar** – operators are modelled after their RxJS counterparts. If you're familiar with `flatMapLatest` and `distinctUntilChanged` and friends, you'll know exactly what is going on

If you, like me, want to use streams in your app but can't afford to take several frustrating weeks to rewire your brain, or you need to introduce streams into an existing codebase gradually, Gurgle is for you. If you're the kind of programmer that enjoys ideological bunfights, it's probably not.


## Installation

```bash
npm install --save gurgle
```

## Usage

You can import individual functions into your app using this ES6 syntax...

```js
import { stream, map, filter } from 'gurgle';
```

...but for the sake of convenience, we'll do it like this in all of the examples:

```js
import * as g from 'gurgle';
```

This is equivalent to `var g = require('gurgle')` if you're old school. (It comes with a UMD build, so you can also use it with an AMD loader or plain ol' script tags.)


### Your first stream

You can create a stream of arbitrary values like so:

```js
const stream = g.stream( () => {
	// this callback is optional – if provided, will be
	// called when the stream is closed. Use it for
	// detaching event handlers etc
	console.log( 'cleaning up' );
});

// All streams have a `push` method, which returns `this`
stream.push( 'a' );
stream.value; // 'a' – the most recently pushed value

// the second and third arguments to `stream.subscribe`
// are optional
stream.subscribe(
	value => console.log( `the value is ${value}` ),
	error => console.log( `oh noes! ${error.message}` ),
	() => console.log( `closing the stream` )
);

stream.push( 'b' );
// -> 'the value is b'

stream.error( new Error( 'something went wrong' ) );
// -> 'oh noes! something went wrong'

stream.push( 'c' ).push( 'd' ).close();
// -> 'the value is c'
// -> 'the value is d'
// -> 'cleaning up'
// -> 'closing the stream'
```

Once a stream is closed, you cannot push more values to it, and the subscriber functions will no longer be called.


### Stream sources

Gurgle provides convenient ways to ways common streams:

```js
// fromEvent – accepts a DOM node (or `window`) and
// an event type. Removes event listener when stream
// is closed
const eventStream = g.fromEvent( window, 'mousemove' );

// fromPromise – creates a stream from a Promise, which
// auto-closes once the promise resolves
const promiseStream = g.fromPromise( ajax( 'http://example.com' ) );

// more to come...
```

### Operators

In Gurgle, operators on streams are standalone functions that return streams:

```js
const input = g.stream();
const mapped = g.map( input, x => ... );
const filtered = g.filter( mapped, x => ... );
```

This works well and is inherently highly *composable*, but if you prefer chaining, you can do so with the `pipe` method:

```js
const input = g.stream();
const filtered = input
	.pipe( g.map, x => ... )
	.pipe( g.filter, x => ... );
```

Consult the wiki for details about individual operators.

## License

MIT
