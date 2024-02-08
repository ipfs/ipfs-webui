import { build } from "esbuild";
import inlineImage from "esbuild-plugin-inline-image";

build({
  entryPoints: ["./src/index.js"],
  outfile: "./dist/.js",
  minify: true,
  bundle: true,
  loader: {
    ".js": "jsx",
  },
  plugins: [inlineImage()],
}).catch(() => process.exit(1));
