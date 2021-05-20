const express = require('express');
const session = require('express-session');
const cors = require('cors');

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

// Require Route
const api = require('./routes/routes');
// Configure app to use route
app.use('/api/', api);

app.get('*', function (req, res) {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.listen(port, () => {
    console.log(`Backend server running on port: ${port}`)
  })