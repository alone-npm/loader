/**
 * 获取一个函数的哈希值
 * @param {function} fn
 * @returns {number}
 */
export function getFunHash(fn) {
    const str = fn.toString();
    let hash = 2166136261;
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return hash >>> 0;
}

/**
 * 等待指定时间（可配合 await 使用，支持回调）
 * @param {number}   ms         等待时间（毫秒）
 * @param {function} [callback] 可选回调函数（执行后会将其返回值作为 Promise 结果）
 * @returns Promise<void> | Promise<cb 的返回值>
 */
export function waitSleep(ms, callback) {
    return new Promise(resolve => (setTimeout(() => {
        if (typeof callback === 'function') {
            resolve(callback());
        } else {
            resolve();
        }
    }, ms)));
}

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
export function aloneLoader(name, xhr = (xhr) => xhr) {
    /**
     * xhr请求
     * @param {string}   path       - 请求路径
     * @param {function} [progress] - 进度回调函数
     * @returns {Promise}
     */
    const _xhr = (path, progress) => {
        return new Promise((resolve) => {
            const http = new XMLHttpRequest();
            http.timeout = 20000;
            http.responseType = 'blob';
            http.open('GET', path, true);
            http.onerror = () => resolve({
                code: http.status,
                msg: `Network Error (${http.statusText})`
            });
            http.ontimeout = () => resolve({
                code: http.status,
                msg: `Request Timeout (${http.statusText})`
            });
            (typeof progress == 'function') && (http.onprogress = (e) => progress(e));
            http.onloadend = () => ((http.status === 200)
                ? resolve({
                    code: 200,
                    msg: "success",
                    body: http.response
                })
                : resolve({
                    code: http.status,
                    msg: `Unknown Error (${http.statusText})`
                }));
            (((((typeof xhr === "function") ? xhr : (xhr) => xhr))(http)) || http).send();
        });
    }

    /**
     * 加载器类
     */
    class aloneLoaderClass {
        /**
         * 构造函数
         * @param {string|number} name - 加载器名称
         */
        constructor(name) {
            /**
             * 加载器名称
             * @type {string|number}
             */
            this.name = name;
            /**
             * 全局参数
             * @type {Object}
             */
            window.aloneFrameLoaderCacheDataList = window.aloneFrameLoaderCacheDataList || {};
            (!window.aloneFrameLoaderCacheDataList[this.name]) && this.del();
        }

        /**
         * 获取载器文件BlobUrl
         * @param {string|number} [alias] - 通过别名或者路径(统一使用绝对路径)
         * @returns {string|Object}
         */
        get(alias) {
            const cache = {...(window.aloneFrameLoaderCacheDataList[this.name] || {})};
            const blob = {...(cache['blob'] || {})};
            return alias ? (blob[alias] || alias) : blob;
        }

        /**
         * 添加载器文件或者数据
         * @param {string|number|function|Array|Object} alias   - string|number=别名, function=执行方法, Array=[路径],Object={别名:路径}
         * @param {string|function}                     [path]  - 路径或者执行方法
         * @returns {this}
         */
        set(alias, path) {
            const aliasTypeof = typeof alias;
            if (aliasTypeof === 'object') {
                if (Array.isArray(alias)) {
                    alias.forEach(key => this.set(key));
                } else {
                    Object.entries(alias).forEach(([key, value]) => this.set(key, value));
                }
            } else if (aliasTypeof === 'function') {
                this.set((alias.name || "callback") + "-" + getFunHash(alias), alias);
            } else if (aliasTypeof === 'string' || aliasTypeof === 'number') {
                window.aloneFrameLoaderCacheDataList[this.name].list.push({
                    alias: alias,
                    value: (typeof path !== 'undefined' ? path : alias)
                });
            }
            return this;
        }

        /**
         * 清空列表
         * @returns {this}
         */
        del() {
            window.aloneFrameLoaderCacheDataList[this.name] = {list: [], blob: {}};
            return this;
        }

        /**
         * 开始加载资源
         * @param {(bar: number,info: {type: 'loading' | 'progress' | 'error' | 'success';data?: any;alias?: string | number;}) => void} on
         * @param {number} [thread=1]   - 并发线程数 (默认1)
         * @param {number} [waiting=0]  - 每个任务等待时间(ms) (默认0)
         * @returns {Promise<this>}
         */
        async load(on = (bar, info) => null, thread = 1, waiting = 0) {
            on = typeof on === 'function' ? on : () => null;
            const {list = []} = window.aloneFrameLoaderCacheDataList[this.name] || {};
            const dealList = list.reduceRight((acc, current) => {
                (!acc.some(item => item.alias === current.alias)) && acc.unshift(current);
                return acc;
            }, []);
            const totalTasks = dealList.length;
            if (totalTasks > 0) {
                const taskProgress = Array(totalTasks).fill(0);
                const emitProgress = (type, data) => {
                    const currentProgress = taskProgress.reduce((sum, p) => sum + p, 0) / totalTasks;
                    const globalProgress = Math.min(100, currentProgress * 100).toFixed(2);
                    on(globalProgress, {type: type, ...data});
                };
                const processSingleTask = async (item, index) => {
                    if (waiting > 0) await new Promise(r => setTimeout(r, waiting));
                    try {
                        if (typeof item.value === 'string') {
                            window.aloneFrameLoaderCacheDataList[this.name].blob[item.alias] = item.value;
                            const xhrRes = await _xhr(item.value, (e) => {
                                if (e.lengthComputable) {
                                    taskProgress[index] = e.loaded / e.total;
                                    emitProgress('progress', {alias: item.alias, data: e});
                                }
                            });
                            if (xhrRes.code === 200) {
                                const blobUrl = URL.createObjectURL(xhrRes.body);
                                window.aloneFrameLoaderCacheDataList[this.name].blob[item.alias] = blobUrl;
                                emitProgress('loading', {alias: item.alias, data: blobUrl});
                            } else {
                                emitProgress('error', {alias: item.alias, data: xhrRes.msg});
                            }
                        } else if (typeof item.value === 'function') {
                            const res = await item.value();
                            window.aloneFrameLoaderCacheDataList[this.name].blob[item.alias] = res;
                            emitProgress('loading', {alias: item.alias, data: res});
                        }
                        taskProgress[index] = 1;
                    } catch (error) {
                        emitProgress('error', {alias: item.alias, data: error.message});
                        taskProgress[index] = 1;
                    }
                };
                const taskGroups = [];
                for (let i = 0; i < totalTasks; i += thread) {
                    taskGroups.push(dealList.slice(i, i + thread));
                }
                for (const [groupIndex, group] of taskGroups.entries()) {
                    await Promise.all(group.map((item, i) => processSingleTask(item, groupIndex * thread + i)));
                }
            }
            on(100.00, {type: "success", data: this.get()});
            return this;
        }
    }

    return new aloneLoaderClass(name);
}

export default aloneLoader;