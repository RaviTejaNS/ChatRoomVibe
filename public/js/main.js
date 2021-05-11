const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
const roomFull = document.getElementById("room-full");
const socket = io();

//Get username and room from URL
const { username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});
console.log(username, room);

//Send username and room to server
socket.emit('joinRoom', {username, room});

//Check for room full
// socket.on('roomFull', roomFull =>{
//     roomFull.style.visibility = 'visible';
// });

//Get users and room
socket.on('roomUsers', ({room, users})=>{
    outputRoomName(room);
    outputUsers(users);
});

//Show message on server
socket.on('message', message =>{
    console.log(message);
    outputMessage(message);

    //Scroll to latest message
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

//For messages
chatForm.addEventListener('submit', e =>{
    e.preventDefault();

    //Get user message from html form
    const msg=e.target.elements.msg.value;

    //Emit message to server
    socket.emit('chatMessage', msg);

    //Clear and focus the message input box after sending message
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

//Show it on client/user
function outputMessage(message) {
    const div = document.createElement('div');
    //Single message
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
						<p class="text">
							${message.text}
						</p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

function outputRoomName(room) {
    roomName.innerText = room;
}

function outputUsers(users) {
    userList.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join('')}`;
}