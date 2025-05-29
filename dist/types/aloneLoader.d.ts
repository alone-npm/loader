/**
 * 获取一个函数的哈希值
 * @param {function} fn
 * @returns {number}
 */
export function getFunHash(fn: Function): number;
/**
 * 等待指定时间（可配合 await 使用，支持回调）
 * @param {number}   ms         等待时间（毫秒）
 * @param {function} [callback] 可选回调函数（执行后会将其返回值作为 Promise 结果）
 * @returns Promise<void> | Promise<cb 的返回值>
 */
export function waitSleep(ms: number, callback?: Function): Promise<any>;
/**
 * 加载器
 * @param {string|number}                               name  - 加载器名称
 * @param {function(xhr:XMLHttpRequest):XMLHttpRequest} [xhr] - xhr配置
 * @returns {aloneLoaderClass}
 *
 * @example
 * ```text
 * 1. 设置加载器名称
 * 2. set  方法添加载器文件或者数据
 * 2. load 方法加载文件
 * 3. get  方法获取载器文件BlobUrl (load执行完成后方可获取)
 * ```
 * ```ts
 * //使用字符串,key为路径
 * const loader = aloneLoader("loader");
 * //设置载器文件或者数据
 * loader.set("/style/logo.png");        //调用 loader.get("/style/logo.png");
 * loader.set("logo","/style/logo.png"); //调用 loader.get("logo");
 * loader.set(()=>null);                 //这只是方法加载,无调用
 * loader.set("fn",()=>"text");          //调用 loader.get("fn"); 可获取执行结果
 *
 * //使用对像,key为别名,可直接使用get调用
 * loader.set({"logo":"/style/logo.png","logo2":"/style/logo2.png","fn":()=>"text"});
 *
 * //使用数组,可直接get调设置的value,方法无法调用
 * loader.set(["/style/logo.png","/style/logo2.png",()=>null]);
 *
 * // 可以使用 import.meta.glob 导入资源列表
 * const resourceList = import.meta.glob([
 *     //src目录 绝对路径调用loader.get("/src/style/assets/logo.png")
 *     "/src/style/assets/logo.png",
 *     //src目录 同上
 *     "@/style/assets/logo2.jpg",
 *     //根目录public 绝对路径调用loader.get("/style/assets/logo3.jpg")
 *     "/style/assets/logo3.jpg"
 * ], {
 *     query: '?url',
 *     import: 'default',
 *     eager: true
 * });
 * loader.set(resourceList);
 * //获取指定目录内全部资源
 * import.meta.glob("@/style/assets/**\/*.*", {query: '?url', import: 'default', eager: true});
 * //获取指定格式
 * import.meta.glob("@/style/assets/**\/*.{jpg,png}", {query: '?url', import: 'default', eager: true});
 * //排除指定格式
 * import.meta.glob("@/style/assets/**\/*.*(!(jpg|png))", {query: '?url', import: 'default', eager: true});
 * //加载器支持进度回调
 * loader.load((bar, info) => {console.log("进度"+bar, info.type);}, 3, 100);
 * ```
 */
export function aloneLoader(name: string | number, xhr?: (xhr: any) => any): {
    /**
     * 加载器名称
     * @type {string|number}
     */
    name: string | number;
    /**
     * 获取载器文件BlobUrl
     * @param {string|number} [alias] - 通过别名或者路径(统一使用绝对路径)
     * @returns {string|Object}
     */
    get(alias?: string | number): string | any;
    /**
     * 添加载器文件或者数据
     * @param {string|number|function|Array|Object} alias   - string|number=别名, function=执行方法, Array=[路径],Object={别名:路径}
     * @param {string|function}                     [path]  - 路径或者执行方法
     * @returns {this}
     */
    set(alias: string | number | Function | any[] | any, path?: string | Function): /*elided*/ any;
    /**
     * 清空列表
     * @returns {this}
     */
    del(): /*elided*/ any;
    /**
     * 开始加载资源
     * @param {(bar: number,info: {type: 'loading' | 'progress' | 'error' | 'success';data?: any;alias?: string | number;}) => void} on
     * @param {number} [thread=1]   - 并发线程数 (默认1)
     * @param {number} [waiting=0]  - 每个任务等待时间(ms) (默认0)
     * @returns {Promise<this>}
     */
    load(on?: (bar: number, info: {
        type: "loading" | "progress" | "error" | "success";
        data?: any;
        alias?: string | number;
    }) => void, thread?: number, waiting?: number): Promise</*elided*/ any>;
};
export default aloneLoader;
