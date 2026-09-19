import { mkdir, rename, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { build } from "vite";

const projectRoot = resolve(import.meta.dirname, "..");
const domains = ["ai", "core", "data", "feedback", "forms", "navigation"];

for (const domain of domains) {
  const temporaryDirectory = resolve(projectRoot, "dist", ".styles", domain);
  await build({
    configFile: false,
    logLevel: "error",
    build: {
      cssCodeSplit: true,
      cssMinify: true,
      emptyOutDir: true,
      lib: {
        entry: resolve(projectRoot, "src", "styles", `${domain}.css`),
        formats: ["es"],
        fileName: "entry",
        cssFileName: "style",
      },
      outDir: temporaryDirectory,
    },
  });

  const domainDirectory = resolve(projectRoot, "dist", domain);
  await mkdir(domainDirectory, { recursive: true });
  await rename(
    resolve(temporaryDirectory, `${domain}.css`),
    resolve(domainDirectory, "style.css"),
  );
}

await rm(resolve(projectRoot, "dist", ".styles"), {
  force: true,
  recursive: true,
});
