const config =  require('./config.js');
const Logger = require('./logger/logger');
const morganMiddleware = require('./logger/httplogger');
const express = require('express');
const cors = require('cors');
const fs = require("mz/fs");
const https = require('https');

const app = express();

const autocomplete = require("./qvantum/autocomplete");
const wocat = require("./qvantum/wocat");
const geospatial = require("./qvantum/geospatial");
const usermanagement = require("./qvantum/usermanagement");
const innovation = require("./qvantum/innovation");

app.use(morganMiddleware);
app.use(express.json());
app.use(cors());
app.use('/temp',express.static('../temp'))


//test route
app.get("/",(req,res)=>res.json({success:"HI"}));

//Qvantum Autocompete Service
app.use("/autocomplete",autocomplete);
//Qvantum WOCAT Service
app.use("/wocat",wocat);
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

if(config.HTTPS === "false"){
    app.listen(config.PORT, config.HOST, () => {
        Logger.info(`Server is up and running @ http://${config.HOST}:${config.PORT}`);
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

        }, app).listen(config.PORT, config.HOST,
        ()=>Logger.info(`Server is up and running @ http://${config.HOST}:${config.PORT}`))
}










