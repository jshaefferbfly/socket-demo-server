import { Server } from "socket.io";

type Message = {
  origin: string;
  message: string;
};

const io = new Server({
  cors: {
    origin: "http://localhost:3000",
  },
});

let numOnline = 0;
let messages: Message[] = [];

io.on("connection", (socket) => {
  numOnline += 1;
  io.emit("clientCountUpdate", numOnline);
  socket.on("disconnect", () => {
    numOnline -= 1;
    io.emit("clientCountUpdate", numOnline);
  });
  socket.on("messageFromClient", async (message, id) => {
    const everyone = await io.fetchSockets();
    const ids = everyone.map((e) => e.id);
    messages = [{ origin: id, message }, ...messages];
    for (const id of ids) {
      if (id !== socket.id) {
        io.to(id).emit("messageFromServer", messages);
      }
    }
  });
});

io.listen(4000);
