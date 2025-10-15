require("dotenv").config({ path: ".localenv" });
const authRouter = require("./routes/authRouter");
const glob = require("glob");
const Koa = require("koa");
const cors = require("@koa/cors");
const bodyParser = require("koa-bodyparser");
const compress = require("koa-compress");
const zlib = require("zlib");
const config = require("./config");
const { log } = require("./middleware/index");

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
app.use(authRouter.routes()).use(authRouter.allowedMethods());
if (!module.parent) app.listen(config.port);
