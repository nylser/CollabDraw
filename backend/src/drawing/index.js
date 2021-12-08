import paper from "paper";

paper.setup(new paper.Size(1000, 1000));
const storage = {};
export function setupDrawingEndpoint(namespace) {
    namespace.use((socket, next) => {
        const username = socket.handshake.auth.username;
        socket.username = username;
        if (!socket.username) {
            return next(new Error("invalid username"));
        }
        next();
    });

    namespace.on("connection", (socket) => {
        const users = [];
        console.log(socket.username);
        for (let [id, socket] of namespace.sockets) {
            users.push({
                userID: id,
                username: socket.username,
            });
        }
        socket.emit("users", { users });
        const exportedStorage = {};
        for (let s in storage) {
            if (storage.hasOwnProperty(s)) {
                exportedStorage[s] = storage[s].exportJSON();
            }
        }
        socket.emit("storage", { exportedStorage });
        socket.on("pointer", (args) => {
            socket.broadcast.emit("pointer", {
                pointer: args,
                userID: socket.id,
                userName: socket.username,
            });
        });
        socket.on("path", (args) => {
            let obj;
            if (args.uuid in storage) {
                obj = storage[args.uuid];
            } else {
                obj = new paper.Path();
                storage[args.uuid] = obj;
            }
            if (args.type === "update") {
                obj.importJSON(args.pathJSON);
            } else if (args.type === "delete") {
                obj.remove();
                console.log(args.uuid, "deleted");
                delete storage[args.uuid];
            }
            socket.broadcast.emit("path", args);
        });
    });
}
