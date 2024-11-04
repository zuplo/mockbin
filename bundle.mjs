import esbuild from "esbuild";
import path from "path";

const toBundle = ["yaml"];

for (const dep of toBundle) {
  const entry = import.meta.resolve(dep);
  const outputPath = new URL(
    path.resolve("./modules/third-party", dep),
    import.meta.url,
  ).pathname;
  const url = new URL(entry);
  await esbuild.build({
    entryPoints: [url.pathname],
    bundle: true,
    platform: "browser",
    target: "es2022",
    legalComments: "linked",
    keepNames: true,
    treeShaking: true,
    minifyIdentifiers: false,
    minifySyntax: false,
    minifyWhitespace: false,
    conditions: ["workerd", "worker", "browser"],
    format: "esm",
    outfile: path.join(outputPath, "index.js"),
  });
}
