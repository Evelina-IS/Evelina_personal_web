# 访客信息收集 API

本站是 GitHub Pages 静态站，页面本身不能保存访客数据。`visitor-worker/` 里提供了一个 Cloudflare Worker 接收端：前端把浏览器基础信息 POST 给 Worker，Worker 再转发到你配置的 webhook。

## 部署

```bash
cd visitor-worker
npm install -g wrangler
wrangler login
wrangler secret put VISITOR_WEBHOOK_URL
wrangler deploy
```

`VISITOR_WEBHOOK_URL` 可以先用 Formspree、Discord webhook、飞书机器人或你自己的 API。Worker 不请求精确定位、摄像头、麦克风、文件等权限，只接收浏览器主动暴露的基础信息。

## 连接前端

部署后会得到类似这样的地址：

```text
https://evelina-visitor-api.<你的账号>.workers.dev
```

把这个地址加到 `docs/javascripts/extra.js` 顶部或任意自定义脚本中：

```js
window.EVELINA_VISITOR_ENDPOINT = "https://evelina-visitor-api.<你的账号>.workers.dev";
```

也可以在页面 `<head>` 里加：

```html
<meta name="evelina-visitor-endpoint" content="https://evelina-visitor-api.<你的账号>.workers.dev">
```

配置好后，每个浏览器会话只会上报一次，避免刷新页面重复记录。
