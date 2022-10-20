const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');

// Set views path
app.set('views', path.join(__dirname, 'views'));
// Set public path
app.set(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'pug');

const ui = require('./routes/main');
const api = require('./routes/api');

app.use('/', ui);
app.use('/api', api);

app.listen(port, () => console.log('Application live on localhost:3000'));


