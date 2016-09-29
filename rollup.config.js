import buble from 'rollup-plugin-buble';

export default {
	entry: 'src/gurgle.js',
	plugins: [ buble() ],
	moduleName: 'gurgle',
	targets: [
		{ format: 'es', dest: 'dist/gurgle.es.js' },
		{ format: 'umd', dest: 'dist/gurgle.umd.js' }
	],
	sourceMap: true
};
