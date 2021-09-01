'use strict';

const express = require('express');
var cors = require('cors');
const app = express();
app.use(cors());
const server = require('http').Server(app);
const uuid = require('uuid').v4;
app.set("view engine", "ejs");
require("dotenv").config();
const PORT = process.env.PORT;
const io = require("socket.io")(server, {
    cors: {
        origin: '*',
    }
});

const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
});

app.use('/peerjs', peerServer);
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect(`/${uuid()}`);
});

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
});

io.on('connection', (socket) => {
    socket.on('join-room', (roomId, userId, userName) => {
        socket.join(roomId);
        socket.to(roomId).broadcast.emit('user-connected', userId);
        socket.on('message', (message) => {
            io.to(roomId).emit('createMessage', message, userName)
        });
    });
})





server.listen(PORT, () => {
    console.log(`Server Started on PORT : ${PORT}`);
})

