import {Server} from "socket.io";


const io = new Server(3000, {
  serveClient: false,
  // below are engine.IO options
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false,
  cors: {
    origin: "*"
  }
});

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  socket.username = username;
  if (!socket.username) {
    return next(new Error("invalid username"));
  }
  next();
})

io.on("connection", (socket => {
  const users = [];
  for (let [id, socket] of io.of("/").sockets) {
    users.push({
      userID: id,
      username: socket.username
    });
  }
  socket.emit("users", users);
  socket.on("pointer", (args) => {
    socket.broadcast.emit("pointer", args)
  });
}));
console.log("Hello, World");
