// Dev-only local blog editor integration.
// Strictly active during `astro dev`. Never executes or bundles during `astro build`.
import { setupDevEditor } from "./dev-editor/server.mjs";

export default function devEditor() {
  return {
    name: "dev-editor",
    hooks: {
      "astro:config:setup": ({ command }) => {
        // Double security guard: do nothing if command is not 'dev'
        if (command !== "dev") {
          return;
        }
      },
      "astro:server:setup": ({ server, logger }) => {
        // astro:server:setup is only executed by Astro when running `astro dev`
        setupDevEditor(server, logger);
        if (logger) {
          logger.info("Local blog editor available at http://localhost:4321/editor");
        }
      },
    },
  };
}
