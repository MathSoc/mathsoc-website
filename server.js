const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'pug');

const ui = require('./routes/main');
const api = require('./routes/api');

app.use('/', ui);
app.use('/api', api);

app.listen(port, () => console.log('Application live on localhost:3000'));


