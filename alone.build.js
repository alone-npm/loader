import {builtinModules} from "module";

//判断生成的文件是否是外部依赖,file=文件名,types: "es" | "cjs" | "umd"
export const external = (id, file, type) => {
    if (id.endsWith(file)) return false;
    if (type === "umd") return false;
    if (id.startsWith("./") || id.startsWith("../")) return true;
    if (builtinModules.includes(id)) return true;
    return /node_modules/.test(id);
}

export default {
    //开发目录
    input: "src",
    //开发格式
    format: ["js", "ts"],
    //打包目录
    output: "dist",
    //默认使用文件名 如 import nameDemo from "name-demo"; 会默认使用什么js
    main: "aloneLoader",
    //上传到npm的目录和文件,默认添加打包目录
    files: ["README.md", "tsconfig.json", "package.json", "dist"],
    //打包目录设置,为空不打包
    dist: {es: "es", cjs: "cjs", umd: "umd", types: "types"},
    //是否更新package.json
    package: true
}