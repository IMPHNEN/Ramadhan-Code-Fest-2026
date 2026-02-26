import esbuild from "esbuild";
import path from "path";

export async function buildClient() {
  const entry = path.join(__dirname, "../client.tsx");
  const outfile = path.join(__dirname, "../../public/_okegas/client.bundle.js");

  console.log("[OkeGas] Building Client...");
  try {
      await esbuild.build({
        entryPoints: [entry],
        bundle: true,
        outfile: outfile,
        minify: false, // Keep readable for debugging for now
        sourcemap: true,
        platform: 'browser',
        target: ['es2020'],
        define: {
            'process.env.NODE_ENV': '"development"' // Default to dev
        },
        loader: { '.tsx': 'tsx', '.ts': 'ts' } // Ensure loaders are explicit
      });
      console.log("[OkeGas] Client Build Complete!");
  } catch (e) {
      console.error("[OkeGas] Client Build Failed:", e);
  }
}
