const express = require('express');
const session = require('express-session');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const mainRouter = require("./controllers");

const port = process.env.PORT || 7555;

const app = express();

const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.resolve(__dirname, '../client/build')));

app.get('/', function (req, res) {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});


app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

//Setup cors
app.use(cors({origin: 'http://localhost:3000'}));

//Setup route for site
app.use(express.static(path.resolve(__dirname, '../client/build')));
app.use(express.static(path.resolve(__dirname, '../client/build')));

//Setup route for files
app.use('/server/uploads', express.static(process.cwd() + '/server/uploads'));

//Setup router for API routes
mainRouter(app); 

//Catch all other requests and reroute to build index.html
app.get('*', function (req, res) {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});


//SOCKET


io.on("connection", (socket) => {
    
    //Retrieve user id from client connection and setup as user_id
    const userid = socket.handshake.auth.id;
    if(!userid){
        return new Error('userid required');
    }
    socket.user_id = userid;

    console.log(`user ${socket.user_id} connected on ${socket.id}`);

    //Send active users back to client
    const users = [];
    for(let [id, socket] of io.of('/').sockets){
        users.push({
            id: id,
            user_id : socket.user_id, 
        });
    }
    io.emit('users', users);

    //Other functions
    socket.on("chat-message", (msg) => {
        console.log(`message: conv_id = ${msg.conv_id} | user_id = ${msg.user_id}`);
        io.emit("chat-message", msg);
    });

    socket.on("disconnect", () => {
        console.log(`user ${socket.user_id} disconnected`);
        const newUsers = users.filter(user => user.user_id !== socket.user_id);
        io.emit('users', newUsers);
    })

})

server.listen(port, () => {
    console.log(`Backend server running on port: ${port}`)
})