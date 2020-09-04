# js-mocker

[中文文档](./README.md)

Use js files to make mock data.

## quick start

Install js-mocker:

```
npm install js-mocker -g
```

Usage:

```
js-mocker [options] <dir>
```

## options

- `-p, --port <port>`: Port to use (defaults to 8092)

## used libraries

- [commander.js](https://github.com/tj/commander.js)
- [browser-sync](https://github.com/BrowserSync/browser-sync)

## How to use js files to generate mock data

`url`: `/api/user/profile?id=1`

First try `/api/user/profile.js`:

```
// export a function
export default (req, res) => {
  // do everything you want
};

// or export an object, a string
export default {
  success: true,
  message: 'ok',
  data: { ... },
};
```

Second try `/api/user.js`:

```
// export a function
export const profile = (req, res) => {
  // do everything you want
};

// or export an object, a string
export const profile = {
  success: true,
  message: 'ok',
  data: { ... },
}
```

`req, res` refers to [Node Http](https://nodejs.org/dist/latest-v8.x/docs/api/http.html), and file name should not contain `.` character, or it will be treated as a static file.

### Support dynamic url

If you need dynamic url, like `/article/{{articleId}}/comment/{{commentId}}`(`/article/1234/comment/5678`), you can use `$d` to replace dynamic ones.

For example, you can make `/article/$d/comment/$d.js` to proxy all urls.

Only starts with number(0-9), will be treated as dynamic url. So, `/article/abc` and `/article/a123` are not dynamic urls.
