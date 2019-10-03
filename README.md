# A Webpack loader for resolving KMT urls

Using `webpack-dev-server` with KMT you need to fix some urls else they will not work... We actually need to emulate the framework within the `webpack-dev-server`.

hence this... 

> NOTE: This is only needed for development!

> NOTE: This loader will not (yet) work for encore dev-server as it works in the reverse... this would require another plugin that redirects back to the referrer...? In any case worthy of an issue, to be resolved ;-)

## Usage

    yarn add @kingsquare/webpack-kmt-resolve-url-loader

Then after the `resolve-url-loader` add the `kmt-resolve-url-loader`

      {
        loader: "kmt-resolve-url-loader",
        options: {
          sourceMap: true,
          root: path.resolve(__dirname, "../view/layout")
        }
      }
