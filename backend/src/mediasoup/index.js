import config from "../config.cjs";
import mediasoup from "mediasoup";

let worker;
const mediaCodecs = config.mediasoup.router.mediaCodecs;

const rooms = {};

export async function setupMediasoupEndpoint(peers) {
    worker = await createWorker();
    console.log(worker);
    console.log("setting up mediasoup namespace");
    peers.use((socket, next) => {
        const username = socket.handshake.auth.username;
        const roomName = socket.handshake.auth.roomName ?? "default";
        socket.username = username;
        socket.roomName = roomName;
        if (!socket.username) {
            return next(new Error("invalid username"));
        }
        socket.join(roomName);
        next();
    });
    peers.on("connection", async (socket) => {
        console.log(`${socket.username} joins ${socket.roomName}`);
        if (!(socket.roomName in rooms)) {
            rooms[socket.roomName] = {
                router: undefined,
                transports: {},
                transportMap: {},
                producerMap: {},
            };
            rooms[socket.roomName].router = await createRouter(
                worker,
                mediaCodecs
            );
        }
        const router = rooms[socket.roomName]["router"];
        const socketTransports = { send: [], recv: [] };
        const producerMap = rooms[socket.roomName].producerMap;
        const transportMap = rooms[socket.roomName].transportMap;
        let rtpCapabilities;

        rooms[socket.roomName].transports[socket.id] = socketTransports;

        socket.on("getRouterRtpCapabilities", (callback) => {
            callback(router.rtpCapabilities);
        });

        socket.on("setClientRtpCapabilities", (rtpCapabilities) => {
            rtpCapabilities = rtpCapabilities;
            console.log("received client rtp capabilities");
        });

        socket.on("createWebRtcTransport", async ({ send }, callback) => {
            const transport = await createTransport(router);
            if (send) {
                socketTransports.send.push(transport);
            } else {
                socketTransports.recv.push(transport);
            }
            transportMap[transport.id] = transport;
            const { id, iceParameters, iceCandidates, dtlsParameters } =
                transport;
            console.log("created transport");
            callback({
                id,
                iceParameters,
                iceCandidates,
                dtlsParameters,
            });
        });

        socket.on(
            "transport-connect",
            ({ transportId, dtlsParameters }, callback) => {
                console.log("connecting", transportId);
                transportMap[transportId].connect({ dtlsParameters });
                callback();
            }
        );
        socket.on(
            "transport-produce",
            async ({ transportId, kind, rtpParameters, appData }, callback) => {
                const producer = await transportMap[transportId].produce({
                    id: transportId,
                    kind,
                    rtpParameters,
                    appData,
                });
                producerMap[producer.id] = producer;

                // notify new producers
                socket
                    .to(socket.roomName)
                    .emit("new-producer", { id: producer.id });

                callback({ id: producer.id });
            }
        );

        socket.on("disconnect", () => {
            producerMap.forEach((producer) => producer.close());
        });
    });
}

async function createWorker() {
    const { rtcMinPort, rtcMaxPort } = config.mediasoup.worker;
    return await mediasoup.createWorker(config.mediasoup.worker);
}

async function createRouter(worker, mediaCodecs) {
    return await worker.createRouter({ mediaCodecs });
}

async function createTransport(router) {
    return await router.createWebRtcTransport({
        listenIps: [{ ip: "127.0.0.1" }],
        enabledUdp: true,
        enabledTcp: true,
        preferUdp: true,
    });
}
