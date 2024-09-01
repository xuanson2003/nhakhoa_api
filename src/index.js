const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT;
const db = require('./config');
const route = require('./routes/index.route');

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('combined'));

db.connectDb();
route(app);

app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`);
});
