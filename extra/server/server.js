/* eslint-disable @typescript-eslint/no-var-requires */
const Koa = require("koa");
const Router = require("koa-router");
const logger = require("koa-logger");
const bodyParser = require("koa-bodyparser");
const got = require("got");
const { HttpsProxyAgent } = require("hpagent");
const sharp = require("sharp");

const app = new Koa();
const router = new Router();

const argv = require("minimist")(process.argv.slice(2));

let proxyAddress = argv["proxyAddress"];
let selectedServer = argv["selectedServer"];
let log = require("electron-log");

log.info("Starting mock server, arguments:", argv);

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

router.post("/configs", (ctx, next) => {
  proxyAddress = ctx.request.body.proxy;
  selectedServer = ctx.request.body.selectedServer;
  log.info(`get proxy config ${JSON.stringify(ctx.request.body)}`);
  ctx.response.status = 200;
});

router.get("/health", (ctx, next) => {
  log.info("Received health check")
  ctx.response.body = "alive";
  ctx.response.status = 200;
});

const urlMapping = (server, tileX, tileY, levelOfDetail) => {
  if (server.includes("mt"))
    return `https://${server}/vt/lyrs=s&x=${tileX}&y=${tileY}&z=${levelOfDetail}`;

  if (server.includes("khm"))
    return `https://${server}/kh/v=908?x=${tileX}&y=${tileY}&z=${levelOfDetail}`;
};

router.get("/tiles/akh:quadKey.jpeg", async (ctx, next) => {
  const quadKey = ctx.params.quadKey;
  log.info("Requesting", quadKey )
  const { tileX, tileY, levelOfDetail } = quadKeyToTileXY(quadKey);

  const url = urlMapping(selectedServer, tileX, tileY, levelOfDetail);

  let options = {
    timeout: {
      request: 15 * 1000,
    },
    agent:
      proxyAddress
        ? {
            https: new HttpsProxyAgent({
              keepAlive: false,
              maxSockets: 128,
              maxFreeSockets: 128,
              scheduling: "fifo",
              proxy: proxyAddress,
            }),
          }
        : undefined,
  };

  console.log(url, proxyAddress);

  const resp = await got(url, options).buffer();

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
  ctx.body = await sharp(resp)
    .modulate({
      lightness: -5,
    })
    .toBuffer();
});

app
  .use(bodyParser())
  .use(logger())
  .use(router.routes())
  .use(router.allowedMethods());
app.listen(39871);
