# alone-loader

一个轻量级的资源加载器，用于前端项目中管理和加载各种资源文件（如图片、样式、脚本等）。

## 功能特点

- 支持多种资源类型的加载和管理
- 提供资源别名机制，便于引用
- 支持异步加载和并发控制
- 提供加载进度监控
- 支持回调函数和 Promise 风格 API
- 资源缓存管理

## 安装

### NPM

```bash
npm install alone-loader
```

### PNPM

```bash
pnpm add alone-loader
```

### YARN

```bash
yarn add alone-loader
```

## 基本用法

### 导入模块

```javascript
import { aloneLoader } from 'alone-loader';
// 或者使用默认导出
import aloneLoader from 'alone-loader';
```

### 创建加载器实例

```javascript
// 创建一个名为 'app' 的加载器实例
const loader = aloneLoader('app');
```

### 添加资源

```javascript

// 直接添加资源路径
loader.set('/path/to/image.jpg');

// 使用别名添加资源
loader.set('logo', '/assets/logo.png');

// 添加回调函数
loader.set('getData', () => 'some data');

// 批量添加资源（数组形式）
loader.set([
    '/assets/style.css',
    '/assets/script.js',
    '/assets/image.png'
]);

// 批量添加资源（对象形式）
loader.set({
    'logo': '/assets/logo.png',
    'banner': '/assets/banner.jpg',
    'getData': () => fetch('/api/data').then(res => res.json())
});

// 可以使用 import.meta.glob 导入资源列表
const resourceList = import.meta.glob([
    //src目录 绝对路径调用loader.get("/src/style/assets/logo.png")
    "/src/style/assets/logo.png",
    //src目录 同上
    "@/style/assets/logo2.jpg",
    //根目录public 绝对路径调用loader.get("/style/assets/logo3.jpg")
    "/style/assets/logo3.jpg"
], {
    query: '?url',
    import: 'default',
    eager: true
});
loader.set(resourceList);

// 获取指定目录内全部资源
import.meta.glob("@/style/assets/**/*.*", {query: '?url', import: 'default', eager: true});

// 获取指定格式
import.meta.glob("@/style/assets/**/*.{jpg,png}", {query: '?url', import: 'default', eager: true});

// 排除指定格式
import.meta.glob("@/style/assets/**/*.*(!(jpg|png))", {query: '?url', import: 'default', eager: true});
```

### 加载资源

```javascript
// 基本加载
loader.load();

// 监控加载进度
loader.load((progress, info) => {
    console.log(`加载进度: ${progress}%`);
    console.log('当前状态:', info.type); // 'loading', 'progress', 'error', 或 'success'
    
    if (info.type === 'error') {
        console.error('加载错误:', info.data);
    }
});

// 设置并发数和等待时间
loader.load(progressCallback, 3, 100); // 3个并发，每个任务间隔100ms
```

### 获取资源

```javascript
// 获取所有资源的 BlobUrl
const allResources = loader.get();

// 获取特定别名的资源
const logoUrl = loader.get('logo');
```

### 清除资源

```javascript
// 清空当前加载器的所有资源
loader.del();
```

## 高级用法

### 自定义 XHR 请求

```javascript
// 创建加载器时自定义 XHR 请求
const loader = aloneLoader('app', (xhr) => {
    // 添加请求头
    xhr.setRequestHeader('Authorization', 'Bearer token');
    return xhr;
});
```

### 链式调用

```javascript
aloneLoader('app')
    .set('logo', '/assets/logo.png')
    .set('styles', '/assets/styles.css')
    .load((progress, info) => {
        console.log(`进度: ${progress}%`);
    })
    .then(loader => {
        // 加载完成后的操作
        const logoUrl = loader.get('logo');
        document.getElementById('logo').src = logoUrl;
    });
```

## 辅助函数

### waitSleep

提供一个异步等待功能：

```javascript
import { waitSleep } from 'alone-loader';

// 等待 1000ms
await waitSleep(1000);

// 等待 1000ms 后执行回调
await waitSleep(1000, () => {
    console.log('1秒后执行');
    return 'done';
}); // 返回 'done'
```

### getFunHash

获取函数的哈希值，用于标识函数：

```javascript
import { getFunHash } from 'alone-loader';

const fn = () => console.log('Hello');
const hash = getFunHash(fn); // 返回唯一的哈希数值
```

## 示例

### 加载图片资源

```javascript
const imageLoader = aloneLoader('images');

imageLoader
    .set('logo', '/assets/logo.png')
    .set('background', '/assets/bg.jpg')
    .load((progress, info) => {
        document.getElementById('progress').textContent = `加载进度: ${progress}%`;
    })
    .then(() => {
        document.getElementById('logo').src = imageLoader.get('logo');
        document.getElementById('container').style.backgroundImage = `url(${imageLoader.get('background')})`;
    });
```

### 预加载网站资源

```javascript
const siteLoader = aloneLoader('website');

// 添加所有需要预加载的资源
siteLoader
    .set({
        'styles': '/css/main.css',
        'mainScript': '/js/main.js',
        'logo': '/images/logo.png',
        'userData': () => fetch('/api/user').then(res => res.json())
    })
    .load((progress, info) => {
        // 更新加载界面
        updateLoadingScreen(progress);

        if (progress >= 100) {
            // 所有资源加载完成，显示网站内容
            showWebsiteContent();
        }
    }, 5); // 使用5个并发请求
```