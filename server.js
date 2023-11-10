const config =  require('./config.js');
const Logger = require('./logger/logger');
const morganMiddleware = require('./logger/httplogger');
const express = require('express');
const cors = require('cors');
const fs = require("mz/fs");
const https = require('https');
const auth = require('express-openid-connect');
require('dotenv/config')

const app = express();

const usermanagement = require("./qvantum/usermanagement");
const innovation = require("./qvantum/innovation");
const rtb = require('./qvantum/rtb-refactored')

const corsOptions = {
    origin: process.env.ALLOWED_ORIGIN,
    credentials: true,
}

app.use(morganMiddleware);
app.use(express.json());
app.use(cors(corsOptions));
app.use('/temp',express.static('../temp'))
// auth router attaches /login, /logout, and /callback routes to the baseURL
//app.use(auth(config));


// req.isAuthenticated is provided from the auth router
// app.get('/', (req, res) => {
//     res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
// });

//test route
app.get("/",(req,res)=>res.json({success:"HI"}));

app.get(`/static/:image`, (req, res) => {
    res.sendFile(`/static/${req.params.image}`, { root: __dirname })
})

//Qvantum Innovation Service
app.use("/innovation",innovation);

app.use("/rtb-refactored",rtb);

//Project Specific
app.use("/usermanagement",usermanagement);

Logger.log(
    {
        message:`NODE_ENV=${config.NODE_ENV}`,
        level:'info'
    }
)

Logger.log(
    {
        message:`HTTPS=${config.HTTPS}`,
        level:'info'
    }
)

if(config.HTTPS === false){
    app.listen(config.PORT, config.IP, () => {
        Logger.info(`Server is up and running @ http://${config.IP}:${config.PORT}`);
    })
}else if(config.HTTPS === "true"){
    const privateKey = fs.readFileSync(`/etc/letsencrypt/live/${config.HOST}/privkey.pem`, 'utf8');
    const certificate = fs.readFileSync(`/etc/letsencrypt/live/${config.HOST}/cert.pem`, 'utf8');
    const ca = fs.readFileSync(`/etc/letsencrypt/live/${config.HOST}/chain.pem`, 'utf8');

    https.createServer(
        {
            key:privateKey,
            cert:certificate,
            ca:ca
                }, app).listen(config.PORT, config.IP,
        ()=>Logger.info(`Server is up and running @ http://${config.IP}:${config.PORT}`))
}

