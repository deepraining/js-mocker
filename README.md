# js-mocker

[English Documentation](./README.en.md)

使用 js 文件生成接口模拟数据.

## 快速开始

安装 js-mocker:

```
npm install js-mocker -g
```

使用:

```
js-mocker [options] <dir>
```

## 参数

- `-p, --port <port>`: 使用的端口 (默认 8092)

## 使用的第三方库

- [commander.js](https://github.com/tj/commander.js)
- [browser-sync](https://github.com/BrowserSync/browser-sync)

## 怎样使用 js 文件生成模拟数据

`url`: `/api/user/profile?id=1`

首先尝试 `/api/user/profile.js`:

```
// 导出一个函数
export default (req, res) => {
  // 做任何事情
};

// 或者导出一个对象，一个字符串
export default {
  success: true,
  message: 'ok',
  data: { ... },
};
```

第二尝试 `/api/user.js`:

```
// 导出一个函数
export const profile = (req, res) => {
  // 做任何事情
};

// 或者导出一个对象，一个字符串
export const profile = {
  success: true,
  message: 'ok',
  data: { ... },
}
```

`req, res` 参考 [Node Http](https://nodejs.org/dist/latest-v8.x/docs/api/http.html), 并且文件名不能包含 `.` 点符号, 否则会被当作静态文件处理.

### 支持动态 url

如果你需要动态 URL，比如 `/article/{{articleId}}/comment/{{commentId}}`(`/article/1234/comment/5678`)，你可以使用 `$d` 代替动态的部分。

比如，你可以用 `/article/$d/comment/$d.js` 代理所有的 url.

只有以数字(0-9)开头，才会被当做动态 url，`/article/abc` 与 `/article/a123` 都不是动态 url。
