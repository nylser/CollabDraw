import {Server} from "socket.io";
import {createServer} from "http";


const httpServer = createServer();
const io = new Server(httpServer, {
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
    socket.broadcast.emit("pointer", {
      pointer: args,
      userID: socket.id,
      userName: socket.username,
    })
  });
  socket.on("path",(args) => {
    socket.broadcast.emit("path", args);
  })
}));
console.log("Hello, World");
httpServer.listen(3000, "0.0.0.0")
