// vite.config.ts
import react from "file:///sessions/rcw-01h18vrvrtzswwrwkltcbq5f/mnt/nostalgia-copy-paste-extension/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { resolve } from "path";
import { defineConfig } from "file:///sessions/rcw-01h18vrvrtzswwrwkltcbq5f/mnt/nostalgia-copy-paste-extension/node_modules/vite/dist/node/index.js";
import { viteStaticCopy } from "file:///sessions/rcw-01h18vrvrtzswwrwkltcbq5f/mnt/nostalgia-copy-paste-extension/node_modules/vite-plugin-static-copy/dist/index.js";
var __vite_injected_original_dirname = "/sessions/rcw-01h18vrvrtzswwrwkltcbq5f/mnt/nostalgia-copy-paste-extension";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: "src/chrome-extension/manifest.json", dest: "." },
        { src: "src/chrome-extension/public/16.png", dest: "./public" },
        { src: "src/chrome-extension/public/32.png", dest: "./public" },
        { src: "src/chrome-extension/public/48.png", dest: "./public" },
        { src: "src/chrome-extension/public/192.png", dest: "./public" },
        { src: "src/chrome-extension/public/pin-icon.png", dest: "./public" },
        {
          src: "src/chrome-extension/public/black-pin-icon.png",
          dest: "./public"
        },
        {
          src: "src/chrome-extension/public/white-pin-icon.png",
          dest: "./public"
        },
        { src: "src/chrome-extension/public/black-copy.png", dest: "./public" },
        { src: "src/chrome-extension/public/white-copy.png", dest: "./public" },
        { src: "src/chrome-extension/public/delete.png", dest: "./public" }
      ]
    })
  ],
  server: {
    open: "/popup-local.html"
  },
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__vite_injected_original_dirname, "popup.html"),
        options: resolve(__vite_injected_original_dirname, "options.html"),
        background: resolve(__vite_injected_original_dirname, "src/chrome-extension/background/background.ts"),
        "content-script": resolve(
          __vite_injected_original_dirname,
          "src/chrome-extension/content-script/content-script.ts"
        )
      },
      output: {
        entryFileNames: "[name].js"
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvc2Vzc2lvbnMvcmN3LTAxaDE4dnJ2cnR6c3d3cndrbHRjYnE1Zi9tbnQvbm9zdGFsZ2lhLWNvcHktcGFzdGUtZXh0ZW5zaW9uXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvc2Vzc2lvbnMvcmN3LTAxaDE4dnJ2cnR6c3d3cndrbHRjYnE1Zi9tbnQvbm9zdGFsZ2lhLWNvcHktcGFzdGUtZXh0ZW5zaW9uL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9zZXNzaW9ucy9yY3ctMDFoMTh2cnZydHpzd3dyd2tsdGNicTVmL21udC9ub3N0YWxnaWEtY29weS1wYXN0ZS1leHRlbnNpb24vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyB2aXRlU3RhdGljQ29weSB9IGZyb20gJ3ZpdGUtcGx1Z2luLXN0YXRpYy1jb3B5JztcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG5cdHBsdWdpbnM6IFtcblx0XHRyZWFjdCgpLFxuXHRcdHZpdGVTdGF0aWNDb3B5KHtcblx0XHRcdHRhcmdldHM6IFtcblx0XHRcdFx0eyBzcmM6ICdzcmMvY2hyb21lLWV4dGVuc2lvbi9tYW5pZmVzdC5qc29uJywgZGVzdDogJy4nIH0sXG5cdFx0XHRcdHsgc3JjOiAnc3JjL2Nocm9tZS1leHRlbnNpb24vcHVibGljLzE2LnBuZycsIGRlc3Q6ICcuL3B1YmxpYycgfSxcblx0XHRcdFx0eyBzcmM6ICdzcmMvY2hyb21lLWV4dGVuc2lvbi9wdWJsaWMvMzIucG5nJywgZGVzdDogJy4vcHVibGljJyB9LFxuXHRcdFx0XHR7IHNyYzogJ3NyYy9jaHJvbWUtZXh0ZW5zaW9uL3B1YmxpYy80OC5wbmcnLCBkZXN0OiAnLi9wdWJsaWMnIH0sXG5cdFx0XHRcdHsgc3JjOiAnc3JjL2Nocm9tZS1leHRlbnNpb24vcHVibGljLzE5Mi5wbmcnLCBkZXN0OiAnLi9wdWJsaWMnIH0sXG5cdFx0XHRcdHsgc3JjOiAnc3JjL2Nocm9tZS1leHRlbnNpb24vcHVibGljL3Bpbi1pY29uLnBuZycsIGRlc3Q6ICcuL3B1YmxpYycgfSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHNyYzogJ3NyYy9jaHJvbWUtZXh0ZW5zaW9uL3B1YmxpYy9ibGFjay1waW4taWNvbi5wbmcnLFxuXHRcdFx0XHRcdGRlc3Q6ICcuL3B1YmxpYycsXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRzcmM6ICdzcmMvY2hyb21lLWV4dGVuc2lvbi9wdWJsaWMvd2hpdGUtcGluLWljb24ucG5nJyxcblx0XHRcdFx0XHRkZXN0OiAnLi9wdWJsaWMnLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHR7IHNyYzogJ3NyYy9jaHJvbWUtZXh0ZW5zaW9uL3B1YmxpYy9ibGFjay1jb3B5LnBuZycsIGRlc3Q6ICcuL3B1YmxpYycgfSxcblx0XHRcdFx0eyBzcmM6ICdzcmMvY2hyb21lLWV4dGVuc2lvbi9wdWJsaWMvd2hpdGUtY29weS5wbmcnLCBkZXN0OiAnLi9wdWJsaWMnIH0sXG5cdFx0XHRcdHsgc3JjOiAnc3JjL2Nocm9tZS1leHRlbnNpb24vcHVibGljL2RlbGV0ZS5wbmcnLCBkZXN0OiAnLi9wdWJsaWMnIH0sXG5cdFx0XHRdLFxuXHRcdH0pLFxuXHRdLFxuXHRzZXJ2ZXI6IHtcblx0XHRvcGVuOiAnL3BvcHVwLWxvY2FsLmh0bWwnLFxuXHR9LFxuXHRidWlsZDoge1xuXHRcdHJvbGx1cE9wdGlvbnM6IHtcblx0XHRcdGlucHV0OiB7XG5cdFx0XHRcdHBvcHVwOiByZXNvbHZlKF9fZGlybmFtZSwgJ3BvcHVwLmh0bWwnKSxcblx0XHRcdFx0b3B0aW9uczogcmVzb2x2ZShfX2Rpcm5hbWUsICdvcHRpb25zLmh0bWwnKSxcblx0XHRcdFx0YmFja2dyb3VuZDogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvY2hyb21lLWV4dGVuc2lvbi9iYWNrZ3JvdW5kL2JhY2tncm91bmQudHMnKSxcblx0XHRcdFx0J2NvbnRlbnQtc2NyaXB0JzogcmVzb2x2ZShcblx0XHRcdFx0XHRfX2Rpcm5hbWUsXG5cdFx0XHRcdFx0J3NyYy9jaHJvbWUtZXh0ZW5zaW9uL2NvbnRlbnQtc2NyaXB0L2NvbnRlbnQtc2NyaXB0LnRzJyxcblx0XHRcdFx0KSxcblx0XHRcdH0sXG5cdFx0XHRvdXRwdXQ6IHtcblx0XHRcdFx0ZW50cnlGaWxlTmFtZXM6ICdbbmFtZV0uanMnLFxuXHRcdFx0fSxcblx0XHR9LFxuXHR9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTZZLE9BQU8sV0FBVztBQUMvWixTQUFTLGVBQWU7QUFDeEIsU0FBUyxvQkFBb0I7QUFDN0IsU0FBUyxzQkFBc0I7QUFIL0IsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDM0IsU0FBUztBQUFBLElBQ1IsTUFBTTtBQUFBLElBQ04sZUFBZTtBQUFBLE1BQ2QsU0FBUztBQUFBLFFBQ1IsRUFBRSxLQUFLLHNDQUFzQyxNQUFNLElBQUk7QUFBQSxRQUN2RCxFQUFFLEtBQUssc0NBQXNDLE1BQU0sV0FBVztBQUFBLFFBQzlELEVBQUUsS0FBSyxzQ0FBc0MsTUFBTSxXQUFXO0FBQUEsUUFDOUQsRUFBRSxLQUFLLHNDQUFzQyxNQUFNLFdBQVc7QUFBQSxRQUM5RCxFQUFFLEtBQUssdUNBQXVDLE1BQU0sV0FBVztBQUFBLFFBQy9ELEVBQUUsS0FBSyw0Q0FBNEMsTUFBTSxXQUFXO0FBQUEsUUFDcEU7QUFBQSxVQUNDLEtBQUs7QUFBQSxVQUNMLE1BQU07QUFBQSxRQUNQO0FBQUEsUUFDQTtBQUFBLFVBQ0MsS0FBSztBQUFBLFVBQ0wsTUFBTTtBQUFBLFFBQ1A7QUFBQSxRQUNBLEVBQUUsS0FBSyw4Q0FBOEMsTUFBTSxXQUFXO0FBQUEsUUFDdEUsRUFBRSxLQUFLLDhDQUE4QyxNQUFNLFdBQVc7QUFBQSxRQUN0RSxFQUFFLEtBQUssMENBQTBDLE1BQU0sV0FBVztBQUFBLE1BQ25FO0FBQUEsSUFDRCxDQUFDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ1AsTUFBTTtBQUFBLEVBQ1A7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNOLGVBQWU7QUFBQSxNQUNkLE9BQU87QUFBQSxRQUNOLE9BQU8sUUFBUSxrQ0FBVyxZQUFZO0FBQUEsUUFDdEMsU0FBUyxRQUFRLGtDQUFXLGNBQWM7QUFBQSxRQUMxQyxZQUFZLFFBQVEsa0NBQVcsK0NBQStDO0FBQUEsUUFDOUUsa0JBQWtCO0FBQUEsVUFDakI7QUFBQSxVQUNBO0FBQUEsUUFDRDtBQUFBLE1BQ0Q7QUFBQSxNQUNBLFFBQVE7QUFBQSxRQUNQLGdCQUFnQjtBQUFBLE1BQ2pCO0FBQUEsSUFDRDtBQUFBLEVBQ0Q7QUFDRCxDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
