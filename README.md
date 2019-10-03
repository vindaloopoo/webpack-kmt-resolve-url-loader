# A Webpack loader for resolving KMT urls

Using webpack with KMT you need to fix some urls else they will not work...

hence this...

## Usage

    yarn add @kingsquare/webpack-kmt-resolve-url-loader

Then after the `resolve-url-loader` add this url resolver ;-)

      {
        loader: "resolve-kmt-url-loader",
        options: {
          sourceMap: true,
          root: path.resolve(__dirname, "../view/layout")
        }
      }
