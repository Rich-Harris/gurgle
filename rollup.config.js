import buble from 'rollup-plugin-buble';

export default {
	entry: 'src/gurgle.js',
	plugins: [ buble() ]
};
