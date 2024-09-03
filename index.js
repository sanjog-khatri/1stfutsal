const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');

const authRouter = require('./Routes/AuthRouter');
const roleRouter = require('./Routes/RoleRouter');
const futsalRouter = require('./Routes/FutsalRouter');
const bookingRouter = require('./Routes/BookingRouter');
const challengeRouter = require('./Routes/ChallengeRouter');

require('dotenv').config();
require('./Models/db');

const app = express();
const PORT = 8080;

app.use(bodyparser.json());
app.use(cors());

app.use('/role', roleRouter);
app.use('/auth', authRouter);
app.use('/futsal', futsalRouter);
app.use('/booking',bookingRouter);
app.use('/challenge', challengeRouter);


app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});