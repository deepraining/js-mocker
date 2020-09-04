import path from 'path';
import fs from 'fs';
import commander from 'commander';
import browserSync from 'browser-sync';
import './register';

import pkg from '../package.json';

const { join } = path;
const { existsSync } = fs;

const cwd = process.cwd();

/**
 * try mock file internal function
 *
 * @param root Root directory
 * @param url
 * @param req
 * @param res
 * @returns {boolean}
 */
const tryMockInternal = ({ root, url, req, res }) => {
  // url: `/one/two/three`
  const urls = url.split('/');
  const lastName = urls[urls.length - 1];

  // first try `/one/two/three.js`
  const filePath = join(root, `${url}.js`);
  if (existsSync(filePath)) {
    // disable cache
    if (require.cache[filePath]) delete require.cache[filePath];

    const m = require(filePath); // eslint-disable-line
    const fn = m ? m.default : undefined;
    if (typeof fn === 'function') {
      fn(req, res);
      return !0;
    }
    if (fn) {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
      res.end(JSON.stringify(fn));
      return !0;
    }
  }

  // second try `/one/two.js` `{three}`
  const parentFilePath = join(root, `${urls.slice(0, -1).join('/')}.js`);
  if (existsSync(parentFilePath)) {
    // disable cache
    if (require.cache[parentFilePath]) delete require.cache[parentFilePath];

    const m = require(parentFilePath); // eslint-disable-line
    const fn = m ? m[lastName] : undefined;

    if (typeof fn === 'function') {
      fn(req, res);
      return !0;
    }
    if (fn) {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
      res.end(JSON.stringify(fn));
      return !0;
    }
  }

  return !1;
};

const digitRegExp = /^\d$/;
const digitMark = '$d';

/**
 * try mock file
 *
 * @param root Root directory
 * @param url
 * @param req
 * @param res
 * @returns {boolean}
 */
const tryMock = ({ root, url, req, res }) => {
  // try url directly
  if (tryMockInternal({ root, url, req, res })) return !0;

  // check if have dynamic url
  const urls = url.split('/');
  let hasDynamic = !1;
  const newUrls = urls.map(s => {
    if (digitRegExp.test(s.slice(0, 1))) {
      hasDynamic = !0;
      return digitMark;
    }
    return s;
  });

  if (hasDynamic) {
    const newUrl = newUrls.join('/');
    if (tryMockInternal({ root, url: newUrl, req, res })) return !0;
  }

  return !1;
};

/**
 * api mock
 */
const makeMock = dirPath => (req, res, next) => {
  // `/one/two/three/?key1=value1`
  let url = req.url.split('?')[0];

  if (url.slice(-1) === '/') url = url.slice(0, -1);

  // url: `/one/two/three`
  const urls = url.split('/');
  const lastName = urls[urls.length - 1];

  // if have '.', will be treated as a static file
  if (url && lastName.indexOf('.') < 0) {
    // ${root}/url.js
    if (tryMock({ root: dirPath, url, req, res })) return;
  }

  next();
};

/**
 * Run command
 *
 * @param dir
 * @param options
 */
function run(dir = '', options = {}) {
  const { port = 8092 } = options;

  const basePath = join(cwd, dir);

  browserSync.init({
    server: {
      baseDir: basePath,
    },
    port,
    middleware: [makeMock(basePath)],
    stats: 'errors-only',
    open: false,
  });
}

commander
  .version(pkg.version)
  .description('Use js files to make mock data')
  .arguments('<dir>')
  .option('-p, --port <port>', 'Port to use (defaults to 8092)')
  .action(run)
  .parse(process.argv);
