import commonjs from 'rollup-plugin-commonjs';

export default {
  entry: './built/fs.js',
  dest: '../compiler/built/fs_bundle.js',
  format: 'umd',
  moduleName: 'fs',
  plugins: [commonjs()],
  external: [
    'typescript',
    'fs'
  ],
  globals: {
    'typescript': 'ts',
    'fs': 'fs'
  }
}
