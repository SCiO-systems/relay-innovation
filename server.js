const config =  require('./config.js');
const Logger = require('./logger/logger');
const morganMiddleware = require('./logger/httplogger');
const express = require('express');
const cors = require('cors');
const fs = require("mz/fs");
const https = require('https');
const auth = require('express-openid-connect');

/*const config = {
    authRequired: false,
    auth0Logout: true,
    secret: 'a long, randomly-generated string stored in env',
    baseURL: 'http://localhost:5000',
    clientID: 'nXlcyLnNGfqGoylG6WwJE9GrMRKRdtaI',
    issuerBaseURL: 'https://sciosystems.eu.auth0.com'
};*/


const app = express();

const autocomplete = require("./qvantum/autocomplete");
const wocat = require("./qvantum/wocat");
const gardian = require("./qvantum/gardian");
const geospatial = require("./qvantum/geospatial");
const usermanagement = require("./qvantum/usermanagement");
const innovation = require("./qvantum/innovation");

app.use(morganMiddleware);
app.use(express.json());
app.use(cors());
app.use('/temp',express.static('../temp'))
// auth router attaches /login, /logout, and /callback routes to the baseURL
//app.use(auth(config));


// req.isAuthenticated is provided from the auth router
app.get('/', (req, res) => {
    res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});

//test route
app.get("/",(req,res)=>res.json({success:"HI"}));

//Qvantum Autocompete Service
app.use("/autocomplete",autocomplete);
//Qvantum WOCAT Service
app.use("/wocat",wocat);
//Qvantum GARDIAN Service
app.use("/gardian",gardian);
//Qvantum Geospatial Service
app.use("/geospatial",geospatial);
//app.use("/upload",upload);
//Qvantum Innovation Service
app.use("/innovation",innovation);
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
    app.listen(config.PORT, config.HOST, () => {
        Logger.info(`Server is up and running @ http://${config.HOST}:${config.PORT}`);
    })
}else if(config.HTTPS === true){
    const privateKey = fs.readFileSync(`/etc/letsencrypt/live/${config.HOST}/privkey.pem`, 'utf8');
    const certificate = fs.readFileSync(`/etc/letsencrypt/live/${config.HOST}/cert.pem`, 'utf8');
    const ca = fs.readFileSync(`/etc/letsencrypt/live/${config.HOST}/chain.pem`, 'utf8');

    https.createServer(
        {
            key:privateKey,
            cert:certificate,
            ca:ca

        }, app).listen(config.PORT, config.HOST,
        ()=>Logger.info(`Server is up and running @ http://${config.HOST}:${config.PORT}`))
}










