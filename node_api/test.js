const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

app.use(
  "/",
  createProxyMiddleware({
    target: "https://dremio.data-aces.com",
    changeOrigin: true,
    onProxyRes: function (proxyRes) {
      delete proxyRes.headers["x-frame-options"];
      delete proxyRes.headers["content-security-policy"];
    },
  })
);

app.listen(3000, () => {
  console.log("Proxy running at http://localhost:3000");
});
