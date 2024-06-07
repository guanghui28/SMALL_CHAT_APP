const socket = io("ws://localhost:3000");

const messageInput = document.querySelector("#message");
const nameInput = document.querySelector("#name");
const chatRoom = document.querySelector("#room");

const chatDisplay = document.querySelector(".chat-display");
const usersList = document.querySelector(".user-list");
const roomList = document.querySelector(".room-list");
const activity = document.querySelector(".activity");

const formMessage = document.querySelector(".form-msg");
const formJoin = document.querySelector(".form-join");

function sendMessage(e) {
	e.preventDefault();

	if (messageInput.value && nameInput.value && chatRoom.value) {
		socket.emit("message", {
			name: nameInput.value,
			message: messageInput.value,
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

// send Message event invoke
formMessage.addEventListener("submit", sendMessage);

// select Room event invoke
formJoin.addEventListener("submit", enterRoom);

// event typing (EX: someone is typing...)
messageInput.addEventListener("keypress", () => {
	socket.emit("activity", nameInput.value);
});
