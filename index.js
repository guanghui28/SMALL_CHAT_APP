import { Server } from "socket.io";
import express from "express";
import path from "path";

const __dirname = path.resolve();
const PORT = process.env.PORT || 3000;
const ADMIN = "Admin";

const app = express();

app.use(express.static(path.join(__dirname, "public")));

const expressServer = app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

// state
const UsersState = {
	users: [],
	setUsers: function (newUsersArray) {
		this.users = [...newUsersArray];
	},
};

const io = new Server(expressServer, {
	cors: {
		origin:
			process.env.NODE_ENV === "production"
				? false
				: ["http://localhost:5500", "http://127.0.0.1:5500"],
	},
});

io.on("connection", (socket) => {
	// Upon connection only to user
	socket.emit("message", buildMessage(ADMIN, "Welcome to Chat App!"));

	socket.on("enterRoom", ({ name, room }) => {
		// leave previous room
		const prevRoom = getUser(socket.id)?.room;
		if (prevRoom) {
			socket.leave(prevRoom);
			io.to(prevRoom).emit(
				"message",
				buildMessage(ADMIN, `${name} has left the room`)
			);
		}

		const user = activateUser(socket.id, name, room);

		// Cannot update previous room users list until after the state in activate user
		if (prevRoom) {
			io.to(prevRoom).emit("userList", {
				users: getUsersInRoom(prevRoom),
			});
		}

		// join room
		socket.join(user.room);

		// to user who joined
		socket.emit(
			"message",
			buildMessage(ADMIN, `You have joined the ${user.room} chat room`)
		);

		// to everyone else
		socket.broadcast
			.to(user.room)
			.emit("message", buildMessage(ADMIN, `${user.name} has joined the room`));

		// Update user list for room
		io.to(user.room).emit("userList", {
			users: getUsersInRoom(user.room),
		});

		// Update rooms list for everyone
		io.emit("roomList", {
			rooms: getAllActiveRooms(),
		});
	});

	socket.on("disconnect", () => {
		const user = getUser(socket.id);
		userLeavesApp(socket.id);

		if (user) {
			io.to(user.room).emit(
				"message",
				buildMessage(ADMIN, `${user.name} has left the room`)
			);

			io.to(user.room).emit("userList", {
				users: getUsersInRoom(user.room),
			});

			io.emit("roomList", {
				rooms: getAllActiveRooms(),
			});
		}
	});

	// Listening for a message event
	socket.on("message", ({ name, text }) => {
		const room = getUser(socket.id)?.room;

		if (room) {
			io.to(room).emit("message", buildMessage(name, text));
		}
	});

	// Listening for activity
	socket.on("activity", (name) => {
		const room = getUser(socket.id)?.room;

		if (room) {
			socket.broadcast.to(room).emit("activity", name);
		}
	});
});

// message function
function buildMessage(name, text) {
	return {
		name,
		text,
		time: new Intl.DateTimeFormat("vi-VN", {
			timeZone: "Asia/Ho_Chi_Minh",
			hour: "numeric",
			minute: "numeric",
			second: "numeric",
			hour12: true,
		}).format(new Date()),
	};
}

// User functions

// user come the room
function activateUser(id, name, room) {
	const user = { id, name, room };

	UsersState.setUsers([
		...UsersState.users.filter((user) => user.id !== id),
		user,
	]);

	return user;
}

// user leave room
function userLeavesApp(id) {
	UsersState.setUsers(UsersState.users.filter((user) => user.id !== id));
}

// find user
function getUser(id) {
	return UsersState.users.find((user) => user.id === id);
}

// get users in room
function getUsersInRoom(room) {
	return UsersState.users.filter((user) => (user.room = room));
}

// get all the rooms is active
function getAllActiveRooms() {
	return Array.from(new Set(UsersState.users.map((user) => user.room)));
}
