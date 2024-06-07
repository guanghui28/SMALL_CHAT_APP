const socket = io("ws://localhost:3000");

const activity = document.querySelector(".activity");
const inputMessage = document.querySelector("input");
const heading = document.querySelector(".welcome");
const leaving = document.querySelector(".leave");

function sendMessage(e) {
	e.preventDefault();

	if (inputMessage.value) {
		socket.emit("message", inputMessage.value);
		inputMessage.value = "";
	}

	inputMessage.focus();
}

document.querySelector("form").addEventListener("submit", sendMessage);

// Listen for messages
socket.on("welcome", (data) => {
	heading.textContent = data;
});

let timer1;
socket.on("leaving", (data) => {
	leaving.style.display = "block";
	leaving.textContent = data;

	clearTimeout(timer1);
	timer1 = setTimeout(() => {
		leaving.style.display = "none";
		leaving.textContent = "";
	}, 3000);
});

socket.on("message", (data) => {
	const li = document.createElement("li");
	li.textContent = data;
	document.querySelector("ul").appendChild(li);
});

let timer2;
socket.on("activity", (data) => {
	activity.textContent = data;

	// clear the notification after 2s
	clearTimeout(timer2);
	timer2 = setTimeout(() => {
		activity.textContent = "";
	}, 2000);
});

inputMessage.addEventListener("keypress", () => {
	socket.emit("activity", socket.id.substring(0, 5));
});
