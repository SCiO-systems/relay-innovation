const config =  require('./config.js');
const morgan = require('morgan');
const logger = require('./logger/logger');
const express = require('express');
const cors = require('cors');
const fs = require("mz/fs");
const https = require('https');
//const csrf = require('csurf');



const app = express();

const autocomplete = require("./qvantum/autocomplete");
const wocat = require("./qvantum/wocat");
const geospatial = require("./qvantum/geospatial");
const usermanagement = require("./qvantum/usermanagement");
/*const csrfProtection = csrf({
    cookie: true
});*/

//app.use(csrfProtection);

app.use(express.json());
app.use(cors());
app.use('/temp',express.static('../temp'))


//test route
app.get("/",(req,res)=>res.json({success:"HI"}));
app.use("/autocomplete",autocomplete);
app.use("/wocat",wocat);
app.use("/geospatial",geospatial);
//app.use("/upload",upload);
app.use("/usermanagement",usermanagement);

logger.log(
    {
        message:`NODE_ENV=${config.NODE_ENV}`,
        level:'info'
    }
)

logger.log(
    {
        message:`HTTPS=${config.HTTPS}`,
        level:'info'
    }
)

if(config.HTTPS === "false"){
    app.listen(config.PORT, config.HOST, () => {
        logger.log(
            {
                message:`APP LISTENING ON http://${config.HOST}:${config.PORT}`,
                level:'info'
            }
        );
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

        }, app).listen(config.PORT, config.HOST,()=>logger.log(
        {
                message:`APP LISTENING ON https://${config.HOST}:${config.PORT}`,
                level:'info'
            }))
}










