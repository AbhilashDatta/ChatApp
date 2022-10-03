const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);


//Set Static folder for local hosting
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', socket => {

    //join room
    socket.on('joinRoom', ({username, room})=>{

        const user = userJoin(socket.id, username, room);
        socket.join(room);

        //Welcome current user
        socket.emit('message',formatMessage('ChatBot','Welcome to AbD Chat App!'));

        //broatcast when a user connects
        socket.broadcast.to(room).emit('message', formatMessage('Abd ChatBot',`${username} has joined the room!`));

        //send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    //listen for chatMessage
    socket.on('chatMessage', msg=>{
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });
    
    //broatcast when a user disconnects
    socket.on('disconnect', ()=>{
        const user = userLeave(socket.id);

        if(user){
            io.to(user.room).emit('message', formatMessage('ChatBot',`${user.username} has left the room!`));

            //send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }

    });

});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));