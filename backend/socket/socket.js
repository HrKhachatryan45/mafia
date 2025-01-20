const express = require('express');
const {Server} = require('socket.io');
const http = require('http');
const app = express();
const server = http.createServer(app)


const io = new Server(server,{
    cors:{
        methods:['GET','POST','PUT','PATCH','DELETE']
    }
});

const userSocketMap = {}

const getReceiverSocketId=(receiverId)=>{
    return userSocketMap[receiverId];
}

io.on('connection', (socket) => {
    console.log("New user connected",socket.id)


    const userId = socket.handshake.query.userId;
    if (userId !== 'undefined') userSocketMap[userId]=socket.id

    console.log(userSocketMap,'users object');

    socket.on('disconnect',()=>{
        console.log('User disconnected',socket.id)
        delete userSocketMap[userId];
    })
})

module.exports = {app,io,server,getReceiverSocketId};