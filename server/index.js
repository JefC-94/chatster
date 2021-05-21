const express = require('express');
const session = require('express-session');
const cors = require('cors');

const mainRouter = require("./controllers");

const app = express();

const path = require('path');

const port = process.env.PORT || 7555;

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use(cors({origin: 'http://localhost:3000'}));

app.use(express.static(path.resolve(__dirname, '../client/build')));

app.use('/server/uploads', express.static(process.cwd() + '/server/uploads'));

mainRouter(app); 

app.get('*', function (req, res) {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.listen(port, () => {
    console.log(`Backend server running on port: ${port}`)
  })