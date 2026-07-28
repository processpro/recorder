import { defineConfig } from "wxt";
import type { PluginOption } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { getExternallyConnectableMatches } from "./src/core/processpro/origins";

/** Escape non-ASCII in bundled JS so Chrome content-script UTF-8 checks pass. */
function asciiContentScriptsPlugin(): PluginOption {
  return {
    name: "processpro-ascii-content-scripts",
    generateBundle(_options, bundle) {
      for (const fileName in bundle) {
        const chunk = bundle[fileName];
        if (chunk.type !== "chunk") continue;
        chunk.code = chunk.code.replace(/[^\x00-\x7F]/g, (ch) =>
          Array.from(ch, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`).join(""),
        );
      }
    },
  };
}

export default defineConfig({
  modules: ["@wxt-dev/module-react", "@wxt-dev/i18n/module"],
  srcDir: "src",
  imports: false,
  webExt: {
    chromiumArgs: ['--user-data-dir=/tmp/mimik-dev-profile', '--window-size=1280,800', '--window-position=0,0', '--force-device-scale-factor=1.25'],
  },
  zip: {
    excludeSources: [
      "mockups/**",
      "docs/**",
      ".claude/**",
      ".planning/**",
      ".worktrees/**",
      "CLAUDE.md",
      "AGENTS.md",
      "CONTRIBUTING.md",
    ],
  },
  alias: {
    '@': 'src',
  },
  vite: () => ({
    plugins: [tailwindcss(), asciiContentScriptsPlugin()],
    // Chrome content scripts reject some Unicode code points (e.g. U+FFFF) even when
    // the file is valid UTF-8. Force ASCII escapes so Load unpacked succeeds.
    // See https://github.com/wxt-dev/wxt/issues/353
    esbuild: {
      charset: 'ascii',
    },
  }),
  hooks: {
    'build:manifestGenerated': (wxt, manifest) => {
      if (wxt.config.browser === 'firefox' && manifest.sidebar_action) {
        (manifest.sidebar_action as Record<string, unknown>).open_at_install = false;
        (manifest.sidebar_action as Record<string, unknown>).default_icon = 'icon32.png';
      }
    },
  },
  manifest: ({ browser, mode, command }) => {
    const isFirefox = browser === 'firefox';
    const includeDevOrigins = command === 'serve' || mode === 'development';
    return {
      name: "__MSG_app_store_title__",
      description: "__MSG_app_description__",
      default_locale: "en",
      permissions: [
        "storage",
        "activeTab",
        "tabs",
        "scripting",
        "unlimitedStorage",
        "webNavigation",
        ...(isFirefox ? [] : ["sidePanel"]),
      ],
      ...(isFirefox
        ? { optional_host_permissions: ["<all_urls>"] }
        : { host_permissions: ["<all_urls>"], minimum_chrome_version: "118" }),
      // Chromium only — ProcessPro may ping via chrome.runtime.sendMessage(extensionId).
      ...(!isFirefox
        ? {
            externally_connectable: {
              matches: getExternallyConnectableMatches(includeDevOrigins),
            },
          }
        : {}),
      icons: {
        16: 'icon16.png',
        32: 'icon32.png',
        48: 'icon48.png',
        128: 'icon128.png',
      },
      action: {},
      ...(isFirefox
        ? {
            sidebar_action: {
              default_panel: "sidepanel.html",
              default_icon: "icon32.png",
              default_title: "ProcessPro Recorder",
              open_at_install: false,
            },
            browser_specific_settings: {
              gecko: {
                id: "mimik@westpoint.io",
                strict_min_version: "128.0",
                data_collection_permissions: {
                  required: ["none"],
                },
              },
            },
          }
        : {
            side_panel: {
              default_path: "sidepanel/index.html",
            },
          }),
    };
  },
});
