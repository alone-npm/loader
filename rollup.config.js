import typescript from '@rollup/plugin-typescript';
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import {external} from "./alone.build.js";

export default [
                    {
                        input: "src/aloneLoader.js",
                        output: [
                        {dir: "dist/es",format: "es",exports: "named"}
                        ],
                        plugins: [resolve(), commonjs(), typescript({declaration: false, declarationDir: undefined, outDir: undefined}), terser()],
                        external: (id) => external(id, "src/aloneLoader.js", "es")
                    },
                    {
                        input: "src/aloneLoader.js",
                        output: [
                        {dir: "dist/cjs",format: "cjs",exports: "named"}
                        ],
                        plugins: [resolve(), commonjs(), typescript({declaration: false, declarationDir: undefined, outDir: undefined}), terser()],
                        external: (id) => external(id, "src/aloneLoader.js", "cjs")
                    },
                    {
                        input: "src/aloneLoader.js",
                        output: [
                        {dir: "dist/umd",format: "umd",name: "aloneLoader",exports: "named"}
                        ],
                        plugins: [resolve(), commonjs(), typescript({declaration: false, declarationDir: undefined, outDir: undefined}), terser()],
                        external: (id) => external(id, "src/aloneLoader.js", "umd")
                    }
];