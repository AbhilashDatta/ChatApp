const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

//Get username and room from URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});


// setup connection to server
const socket = io();

// Join chat room
socket.emit('joinRoom', { username, room});

// get room and users
socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room);
    outputUsers(users);
});


// Message from server 
socket.on('message', message =>{
    outputMessage(message);

    //scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit

chatForm.addEventListener('submit', (e)=>{
    e.preventDefault();

    // Get message text
    const msg = e.target.elements.msg.value;

    // Emit message to server
    socket.emit('chatMessage', msg);

    // clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

// Add roomName to DOM
function outputRoomName(room){
    roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users){
    let li = ''
    users.forEach(user => {
        if(user.username !== username){
            li += `<li>${user.username}</li>`
        }
        else{
            li += `<li><b>${user.username}</b></li>`
        }
    });
    userList.innerHTML = li;
}