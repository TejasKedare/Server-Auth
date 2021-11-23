const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const passport = require('passport')

const app = express();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Cors Midddleware
app.use(cors());

// path module to static dir
app.use(express.static(path.join(__dirname, 'public')));

// Passport Middleware
app.use(passport.initialize())

// Passport Strategy
require('./config/passport')(passport);



// Connecting to Database
const db = require('./config/keys').mongoURI
mongoose.connect(db, { useNewUrlParser: true })
    .then(() => {
        console.log(`Succesfully connected to Database ${db}`);
    })
    .catch(err => console.log(` Cant connect to Database ${err}`))

const users = require('./routes/api/users');

app.use('/api/users', users);


const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server is running on Port ${PORT}`);
})