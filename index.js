import { Server } from "socket.io";
import express from "express";
import path from "path";

const __dirname = path.resolve();

const app = express();

app.use(express.static(path.join(__dirname, "public")));

const expressServer = app.listen(3000, () => {
	console.log(`Server is running on port ${3000}`);
});

const io = new Server(expressServer, {
	cors: {
		origin:
			process.env.NODE_ENV === "production"
				? false
				: ["http://localhost:5500", "http://127.0.0.1:5500"],
	},
});

io.on("connection", (socket) => {
	// emit an event to only the current user
	socket.emit("welcome", "Welcome to ChatApp!");

	socket.on("message", (data) => {
		io.emit("message", data);
	});

	socket.on("activity", (socketID) => {
		socket.broadcast.emit("activity", `${socketID} is typing...`);
	});

	socket.on("disconnect", () => {
		// emit an event to other users except the current one
		socket.broadcast.emit(
			"leaving",
			`${socket.id.substring(0, 5)} has left Chat app`
		);
	});
});
