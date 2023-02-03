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

let configs = {
  proxyAddress: argv["proxyAddress"],
  selectedServer: argv["selectedServer"],
  cacheEnabled: false,
  cacheLocation: argv["cacheLocation"] || "./cache.sqlite",
  mapboxAccessToken: argv["mapboxAccessToken"]
};

console.log("Using configs", configs);

let log = require("electron-log");
console.log("Log path", log.transports.file.getFile().path);
const moment = require("moment");
const { MTGoogle, KHMGoogle, ArcGIS, BingMap, MapBox } = require("./map-providers");

const Keyv = require("keyv");

class DummyKeyv {
  constructor() {
    console.log("Use dummy keyv");
  }

  async set(key, value) {}

  async clear() {}

  async get(key, options) {}
}

const keyv =
  configs.cacheEnabled
    ? new Keyv(`sqlite://${configs.cacheLocation.replace("\\\\", "/")}`)
    : new DummyKeyv();

const statics = {
  numOfImageLoaded: 0,
  lastLoadingImageUrl: 0,
  lastLoadTime: 0,
};

let lastLoadedImage = null;

mapProviders = [new MTGoogle(), new KHMGoogle(), new ArcGIS(), new BingMap(), new MapBox(configs.mapboxAccessToken)];

router.post("/configs", (ctx, next) => {
  configs = { ...configs, ...ctx.request.body };
  log.info(`new settings ${JSON.stringify(configs)}`);
  ctx.response.status = 200;
});

router.get("/last-image", (ctx, next) => {
  ctx.response.set("Content-Type", "image/jpeg");
  ctx.response.status = 200;
  ctx.body = lastLoadedImage;
});

router.get("/statics", (ctx, next) => {
  ctx.body = statics;
});

router.post("/clear-cache", async (ctx, next) => {
  log.info("Clearing cache");
  await keyv.clear();
  log.info("Cache cleared");
  ctx.response.status = 200;
});

router.get("/health", (ctx, next) => {
  log.info("Received health check");
  ctx.response.body = "alive";
  ctx.response.status = 200;
});

const getMapProvider = (server) => {
  return mapProviders.filter((it) => it.name === server)[0];
};

router.get("/tiles/a:quadKey.jpeg", async (ctx, next) => {
  const quadKey = ctx.params.quadKey.replace("kh", "");

  let mapProvider = getMapProvider(configs.selectedServer);
  const url = mapProvider.map(quadKey);

  let options = {
    timeout: {
      request: 15 * 1000,
    },
    agent: configs.proxyAddress
      ? {
          https: new HttpsProxyAgent({
            keepAlive: false,
            maxSockets: 128,
            maxFreeSockets: 128,
            scheduling: "fifo",
            proxy: configs.proxyAddress,
          }),
        }
      : undefined,
  };

  let content =
    configs.cacheEnabled ? await keyv.get(quadKey) : undefined;

  if (content) {
    log.info("Load from cache", url);
  } else {
    log.info("Downloading", url, configs.proxyAddress);
    content = await got(url, options).buffer();

    if (await mapProvider.isInvalid(content)) {
      ctx.response.statusCode = 404;
      return;
    }

    await keyv.set(quadKey, content);
  }

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
  let image = await sharp(content)
    .modulate({
      lightness: -5,
    })
    .toBuffer();
  ctx.body = image;

  lastLoadedImage = image;
  statics.numOfImageLoaded += 1;
  statics.lastLoadingImageUrl = url;
  statics.lastLoadTime = moment().timestamp;
  log.info(`Loaded ${quadKey}`);
});

app
  .use(bodyParser())
  .use(logger())
  .use(router.routes())
  .use(router.allowedMethods());
app.listen(39871);
