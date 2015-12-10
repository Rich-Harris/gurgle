# gurgle

A stream library.

## Really? Why?

On a recent project, I wanted to use RxJS to avoid what would otherwise have become a minefield of filthy state management and complex conditionals. Instead, I wondered into a minefield of FRP ideology and bad documentation. RxJS looks great and I think I'm going to be friends with it one day, but right now I need something a little leaner and more hackable.

It's a toy library in other words, built for a single project. Don't use it.

## Installation

```bash
npm install --save gurgle
```

## Some notes on design

Gurgle is designed to work particularly well with [Rollup](http://rollupjs.org) – rather than having a giant prototype (as with, say `Rx.Observable`), operators on streams are standalone functions that return streams. This way, any operators you're not using in your app can be tree-shaken out of the library.

```js
import { stream, map, filter } from 'gurgle';

const input = stream();
const mapped = map( stream, x => ... );
const filtered = filter( mapped, x => ... );
```

This works well and is inherently highly *composable*, but if you prefer chaining, you can do so with the `pipe` method:

```js
import { stream, map, filter } from 'gurgle';

const input = stream();
const filtered = input
	.pipe( map, x => ... )
	.pipe( filter, x => ... );
```

TK – rationale for `stream.push` and `stream.value`

## Usage

TK

## License

MIT
