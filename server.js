const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const config  = require('./config/config.js');

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
require('./src/Routes/index')(app);
app.listen(config.PORT, () => {
    console.log(`APP LISTENING ON http://${config.HOST}:${config.PORT}`);
});