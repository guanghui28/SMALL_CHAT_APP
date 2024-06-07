const socket = io("ws://localhost:3000");

const messageInput = document.querySelector("#message");
const nameInput = document.querySelector("#name");
const chatRoom = document.querySelector("#room");

const chatDisplay = document.querySelector(".chat-display");
const usersList = document.querySelector(".user-list");
const roomsList = document.querySelector(".room-list");
const activity = document.querySelector(".activity");

const formMessage = document.querySelector(".form-msg");
const formJoin = document.querySelector(".form-join");

// send Message event invoke
formMessage.addEventListener("submit", sendMessage);

// select Room event invoke
formJoin.addEventListener("submit", enterRoom);

// event typing (EX: someone is typing...)
messageInput.addEventListener("keypress", () => {
	socket.emit("activity", nameInput.value);
});

function sendMessage(e) {
	e.preventDefault();

	if (messageInput.value && nameInput.value && chatRoom.value) {
		socket.emit("message", {
			name: nameInput.value,
			text: messageInput.value,
		});

		messageInput.value = "";
	}

	messageInput.focus();
}

function enterRoom(e) {
	e.preventDefault();

	if (nameInput.value && chatRoom.value) {
		socket.emit("enterRoom", {
			name: nameInput.value,
			room: chatRoom.value,
		});
	}
}

socket.on("message", ({ name, text, time }) => {
	activity.textContent = "";
	const li = document.createElement("li");
	li.className = "post";

	if (name === nameInput.value) {
		li.className = "post post--left";
	}
	if (name !== nameInput.value && name !== "Admin") {
		li.className = "post post--right";
	}
	if (name !== "Admin") {
		li.innerHTML = `
			<div class="post__header ${
				name === nameInput.value ? "post__header--user" : "post__header--reply"
			}">
				<span class="post__header--name">${name}</span>
				<span class="post__header--time>${time}</span>
				<div class="post__text">${text}</div>
			</div>
		`;
	} else {
		li.innerHTML = `<div class="post__text">${text}</div>`;
	}

	chatDisplay.appendChild(li);
	chatDisplay.scrollTop = chatDisplay.scrollHeight;
});

socket.on("userList", ({ users }) => {
	showUsers(users);
});

socket.on("roomList", ({ rooms }) => {
	showRooms(rooms);
});

let timer;
socket.on("activity", (name) => {
	activity = `${name} is typing...`;
	clearTimeout(timer);
	timer = setTimeout(() => {
		activity.textContent = "";
	}, 3000);
});

function showUsers(users) {
	usersList.textContent = "";
	if (users) {
		usersList.innerHTML = `<em>Users in the room${chatRoom.value}: </em>`;

		users.forEach((user, i) => {
			usersList.textContent += `${user.name}`;
			if (users.length > 1 && i !== users.length - 1) {
				usersList.textContent += ", ";
			}
		});
	}
}

function showRooms(rooms) {
	roomsList.textContent = "";
	if (rooms) {
		roomsList.innerHTML = `<em>Active Room: </em>`;

		rooms.forEach((room, i) => {
			roomsList.textContent += `${room}`;

			if (rooms.length > 1 && i !== rooms.length - 1) {
				roomsList.textContent += ", ";
			}
		});
	}
}
