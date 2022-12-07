const express = require('express');
const path = require('path');


const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'pug');

const routes = require('./server/routes');
const authRoutes = require("./server/routes/auth");
const api = require('./server/api');

app.locals.basedir = path.join(__dirname, '');

app
    .use(express.json())
    .use(express.urlencoded({ extended: false }))
    .use(express.static(path.join(__dirname, "public")))
    .set("views", path.join(__dirname, "views"))
    .use(routes)
    .use('/api', api)
    //Auth Middleware ...
    .use(authRoutes)
    .use((req, res) => {
        res.status(404).render("pages/error");
    })

app.listen(port, () => console.log('Application live on localhost:3000'));


