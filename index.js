require("dotenv").config({ path: ".localenv" });
const glob = require("glob");
const Koa = require("koa");
const cors = require("@koa/cors");
const bodyParser = require("koa-bodyparser");
const compress = require("koa-compress");
const zlib = require("zlib");
const config = require("./config");
const { log } = require("./middleware/index");
const { createServer } = require("http");
const { initSocket } = require("./socket/socketHandler.js"); 
const app = new Koa();

app.use(bodyParser());
app.use(cors({ origin: "*" }));

app.use(
  compress({
    threshold: 2048,
    flush: zlib.Z_SYNC_FLUSH,
    level: 9,
  })
);

app.use(log);
// bootstrap routes
glob(`${__dirname}/routes/*.js`, { ignore: "**/index.js" }, (err, matches) => {
  if (err) {
    throw err;
  }

  matches.forEach((file) => {
    const controller = require(file); // eslint-disable-line
    app.use(controller.routes()).use(controller.allowedMethods());
  });
});


const httpServer = createServer(app.callback());
initSocket(httpServer);
if (!module.parent) {
  httpServer.listen(config.port, () => {
    console.log(` Server is running on port ${config.port}`);
    console.log(` Koa (HTTP) and Socket.IO (WebSocket) are sharing the same port.`);
  });
}
