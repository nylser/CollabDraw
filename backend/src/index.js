import { Server } from "socket.io";
import { createServer } from "https";
import fs from "fs";
import config from "./config.cjs";
import { setupDrawingEndpoint } from "./drawing/index.js";
import { setupMediasoupEndpoint } from "./mediasoup/index.js";

const { sslKey, sslCrt } = config;
if (!fs.existsSync(sslKey) || !fs.existsSync(sslCrt)) {
    console.error("SSL files are not found. check your config.js file");
    process.exit(0);
}
const tls = {
    cert: fs.readFileSync(sslCrt),
    key: fs.readFileSync(sslKey),
};
const webServer = createServer(tls);
webServer.on("error", (err) => {
    console.error("starting web server failed:", err.message);
});
const io = new Server(webServer, {
    serveClient: false,
    // below are engine.IO options
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false,
    cors: {
        origin: "*",
    },
});

const drawingNamespace = io.of("/drawing");
setupDrawingEndpoint(drawingNamespace);
const mediasoupNamespace = io.of("/mediasoup");
setupMediasoupEndpoint(mediasoupNamespace);

webServer.listen(3000, "0.0.0.0");
console.log("Webserver is running");
