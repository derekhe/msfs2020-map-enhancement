/* eslint-disable @typescript-eslint/no-var-requires */
const Koa = require("koa");
const Router = require("koa-router");
const logger = require("koa-logger");
const bodyParser = require("koa-bodyparser");
const got = require("got");
const { HttpsProxyAgent } = require("hpagent");

const app = new Koa();
const router = new Router();

const quadKeyToTileXY = function (quadKey) {
  let tileX = 0;
  let tileY = 0;
  const levelOfDetail = quadKey.length;

  for (let i = levelOfDetail; i > 0; i -= 1) {
    const mask = 1 << (i - 1);
    const t = quadKey[levelOfDetail - i];
    if (t === "1") {
      tileX |= mask;
    }
    if (t === "2") {
      tileY |= mask;
    }
    if (t === "3") {
      tileX |= mask;
      tileY |= mask;
    }
  }

  return { tileX, tileY, levelOfDetail };
};

let proxy = "http://192.168.50.15:1082";

router.post("/configs", (ctx, next) => {
  proxy = ctx.request.body.proxy;
  console.log(`get proxy config ${proxy}`);
  ctx.response.status = 200;
});

router.get("/tiles/akh:quadKey.jpeg", async (ctx, next) => {
  const quadKey = ctx.params.quadKey;
  const { tileX, tileY, levelOfDetail } = quadKeyToTileXY(quadKey);
  const server = "khms1.google.com";
  const url = `https://${server}/kh/v=908?x=${tileX}&y=${tileY}&z=${levelOfDetail}`;

  console.log(url, proxy);

  const resp = await got(url, {
    timeout: {
      request: 15 * 1000,
    },
    agent: {
      https: new HttpsProxyAgent({
        keepAlive: false,
        maxSockets: 128,
        maxFreeSockets: 128,
        scheduling: "fifo",
        proxy: proxy,
      }),
    },
  }).buffer();

  ctx.response.set("content-type", "image/jpeg");
  ctx.response.set("Content-Type", "image/jpeg");
  ctx.response.set("Last-Modified", "Sat, 24 Oct 2020 06:48:56 GMT");
  ctx.response.set("ETag", "9580");
  ctx.response.set("Server", "Microsoft-IIS/10.0");
  ctx.response.set("X-VE-TFE", "BN00004E85");
  ctx.response.set("X-VE-AZTBE", "BN000033DA");
  ctx.response.set("X-VE-AC", "5035");
  ctx.response.set("X-VE-ID", "4862_136744347");
  ctx.response.set("X-VE-TILEMETA-CaptureDatesRang", "1/1/1999-12/31/2003");
  ctx.response.set("X-VE-TILEMETA-CaptureDateMaxYY", "0312");
  ctx.response.set("X-VE-TILEMETA-Product-IDs", "209");
  ctx.body = resp;
});

app
  .use(bodyParser())
  .use(logger())
  .use(router.routes())
  .use(router.allowedMethods());
app.listen(39871);