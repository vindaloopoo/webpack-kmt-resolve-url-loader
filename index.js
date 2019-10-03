const path = require("path");
const Promise = require("bluebird");
const fs = Promise.promisifyAll(require("fs"));

const projectRoot = path.resolve(__dirname, "../..");
const projectPublicRoot = path.resolve(projectRoot, "view/layout");
const kmtRoot = path.resolve(projectRoot, "../..");
const kmtPublicRoot = path.resolve(kmtRoot, "public_html");

const replace = p => p.replace(projectPublicRoot, kmtPublicRoot);

// TODO fix this to the current webpack-dev-server url
const baseUrl = "__BASE_URL__";

module.exports = function applyLoader(content, map) {
    if (this.cacheable) {
        this.cacheable();
    }
    const cb = this.async();

    // first remove any virtual cache busters
    content = content

    // replace /download with abs /download url
        .replace(/\/download/gim, `${baseUrl}/download`)
        // replace /img with abs /img url
        .replace(/\/.*?\/layout\/((img|css)\/)/gim, `${baseUrl}/$1`)

        // remove image.kmt123.png like cachebusters
        .replace(/\.kmt[\w]+\./gim, ".")

        // clean up any ?r=123 cache busters
        .replace(/\?r=[\d]+/gim, "");

    // now try local vs base files
    // i.e.
    //      custom/X/view/layout/img/test.png
    // is probably
    //      public_html/img/test.png
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
                console.log(r.uri, " -> ", r.replace);
                content = content.replace(r.uri, r.replace);
            });
            cb(null, content, map);
        });
        return;
    }

    cb(null, content, map);
};
