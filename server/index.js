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
    console.log("a user connected");

    socket.on("chat-message", (msg) => {
        console.log("message: " + msg);
        io.emit("chat-message", msg);
    });

    socket.on("disconnect", () => {
        console.log("user disconnected");
    })

})

server.listen(port, () => {
    console.log(`Backend server running on port: ${port}`)
})