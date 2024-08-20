const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const authRouter = require('./Routes/AuthRouter');
const roleRouter = require('./Routes/RoleRouter');

require('dotenv').config();
require('./Models/db');

const app = express();
const PORT = 8080;

app.use(bodyparser.json());
app.use(cors());

app.use('/role', roleRouter)
app.use('/auth', authRouter);

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});
