require("dotenv").config();
const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const botName = 'Vibe'

//For setting static folder
app.use(express.static(path.join(__dirname, 'public')));

//To run when any user connects
io.on('connection', socket => {
    socket.on('joinRoom', ({username, room}) =>{
        const user = userJoin(socket.id, username, room);
        
        // if(user == null)
        // {
        //     socket.emit('roomFull', 'Room Full');
        // }

        socket.join(user.room);

        console.log('New Connection...');
        //To client who joins
        socket.emit('message', formatMessage(botName, 'Welcome to Vibe'));

        //To all users except themselves
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has entered the chat!`));

        //Send users and room info to main
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    socket.on('chatMessage', (msg) =>{
        const user = getCurrentUser(socket.id);

        //returns formatMessage as 'message' to the emit function;
        io.to(user.room).emit('message', formatMessage(user.username,  msg));
    });
    
    //On disconnect
    socket.on('disconnect', () =>{
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat!`));
        }
        
        //Send users and room info to main
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });
});


const PORT = process.env.PORT || 3200;

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));    
//end