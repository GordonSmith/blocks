import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import postcss from "rollup-plugin-postcss";

export default [
    {
        input: 'blocks/data-file-block/index.tsx',
        output: {
            file: 'dist/data-file-block/index.js',
            format: 'iife',
            name: "BlockBundle"
        },
        external: ["fs", "path", "assert", "react", "react-dom", "@primer/react"],
        plugins: [
            typescript({
                compilerOptions: {
                    lib: ["es2020"],
                    target: "es2020",
                    jsx: "react"
                }
            }),
            nodeResolve(),
            commonjs(),
            postcss({
                extract: true,
                extensions: [".css"],
                minimize: true
            })
        ]
    }
];