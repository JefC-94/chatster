require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const {setLastLogin, clearLastLogin} = require('./controllers/auth/handlers');

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

//Setup route for files
app.use('/server/uploads', express.static(process.cwd() + '/server/uploads'));

//Setup router for API routes
mainRouter(app); 

//Catch all other requests and reroute to build index.html
app.get('*', function (req, res) {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});


//SOCKET INITIALIZATION AND EVENT EMITTERS + LISTENERS
let userSessions = [];

io.on("connection", (socket) => {
    
    //Retrieve user id from client connection and setup as user_id
    const userid = socket.handshake.auth.id;
    if(!userid){
        return new Error('userid required');
    }
    socket.user_id = userid;
    
    console.log(`user ${socket.user_id} connected`);
    
    //Clear last_login value for this user -> user is logged in and getConvs() on client will ignore this if statement!
    clearLastLogin(socket.user_id);

    //Add this user to the array of users + send back to client for updates
    userSessions.push({
        id: socket.id,
        user_id : socket.user_id, 
    });
    io.emit('users', userSessions);

    //console.log(userSessions);

    //MESSAGE EVENT - INDVIDUAL CHAT -> FIND USER ON ID AND SEND TO HIS SOCKET
    //It's possible that a user is logged in via different browsers
    // all these sockets should get the message -> for loop
    socket.on("chat-message", (msg) => {
        console.log(`message: conv_id = ${msg.conv_id} | to = ${msg.to_id}`);
        const findUsers = userSessions.filter(session => session.user_id === msg.to_id);
        for (userSession of findUsers){
            socket.broadcast.to(userSession.id).emit("chat-message", msg);
        }
    });

    //CONTACT OPERATION -> Send emit event to the right user to reload contacts and otherusers
    //Data has action -> if it is necessary to display a snackbar to the other user
    //Transfer the action property as method, it's null in the case of reject and delete/block
    socket.on('contact-update', (data) => {
        const findUsers = userSessions.filter(session => session.user_id === data.to_id);
        for(userSession of findUsers){
            socket.broadcast.to(userSession.id).emit('contact-update', {message: data.action});
        }
    })

    socket.on("disconnect", () => {
        console.log(`user ${socket.user_id} disconnected`);
        userSessions = userSessions.filter(user => user.user_id !== socket.user_id);
        //Save datetime of this moment as last_login for this user in db -> require from auth handlers
        setLastLogin(socket.user_id);
        io.emit('users', userSessions);
    })

})


server.listen(port, () => {
    console.log(`Backend server running on port: ${port}`)
})