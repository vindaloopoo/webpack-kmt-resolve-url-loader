const path = require("path");
const Promise = require("bluebird");
const fs = Promise.promisifyAll(require("fs"));
const { getOptions } = require("loader-utils");
const validateOptions = require("schema-utils");

const projectRoot = path.resolve(__dirname, "../..");
const projectPublicRoot = path.resolve(projectRoot, "view/layout");
const kmtRoot = path.resolve(projectRoot, "../..");
const kmtPublicRoot = path.resolve(kmtRoot, "public_html");

const replace = p => p.replace(projectPublicRoot, kmtPublicRoot);

const optionsSchema = {
  type: "object",
  properties: {
    baseUrl: {
      type: "string",
      format: "uri"
    }
  },
  required: ["baseUrl"]
};

module.exports = function applyLoader(content, map) {
  const options = getOptions(this);
  validateOptions(optionsSchema, options, "ResolveKmtUrlLoader");

  if (this.cacheable) {
    this.cacheable();
  }
  const cb = this.async();

  content = content

    // replace /download with abs /download
    .replace(/\/download/gim, `${options.baseUrl}/download`)

    // replace /<known> with abs /<known>
    .replace(/\/.*?\/layout\/((img|css)\/)/gim, `${options.baseUrl}/$1`)

    // remove any possible cache busters

    // clean up any image.kmt123.png
    .replace(/\.kmt[\w]+\./gim, ".")

    // clean up any ?r=123
    .replace(/\?r=[\d]+/gim, "");

  // now try local vs base files
  // i.e.
  //      custom/X/view/layout/img/test.png
  // (if not exists) would, according to the framework, be
  //      public_html/img/test.png
  //
  // This mirrors the framework expectation
  //
  const matches = content.match(new RegExp(`${projectRoot}[^'")]+`, "mig"));

  if (matches && matches.length) {
    Promise.map(
      matches,
      uri =>
        new Promise((resolve /* , reject */) => {
          fs.stat(uri, (err /* , stats */) => resolve({ uri, replace: err ? replace(uri) : false }));
        })
    ).then(results => {
      results.forEach(r => {
        if (!r.replace) {
          return;
        }
        // eslint-disable-next-line
        console.log(r.uri, ' -> ', r.replace);
        content = content.replace(r.uri, r.replace);
      });
      cb(null, content, map);
    });
    return;
  }

  cb(null, content, map);
};
