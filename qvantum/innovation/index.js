const express = require('express');
const router = express.Router();
const axios = require('axios');
const Logger = require("../../logger/logger");

const generateToken = async()=>{

    let config = {
        method: 'get',
        url: process.env.AGRONOMY_API + '/api/generatetoken',
        headers: {}
    };

    return axios(config)
        .then(function (response) {
            return response.data;
        })
        .catch(function (error) {
            return error;
        });

}

const fetchRTBResults = async(data,access_token)=>{
    let dataRequest = JSON.stringify(data);
    let config = {
        method: 'post',
        url: process.env.AGRONOMY_API + '/api/rtb',
        headers: {
            'Authorization': `Bearer ` + access_token,
            'Content-Type': 'application/json'
        },
        data: dataRequest
    };

    return axios(config)
        .then(function (response) {
            return response.data;
        })
        .catch(function (error) {
            Logger.error(JSON.stringify(error));
            Logger.error("AXIOS CONFIG: "+JSON.stringify(config));
            return error;
        });

}

router.post("/search",async(req,res)=>{
    Logger.info("Search Innovation Catalogue: "+JSON.stringify(req.body));
    const token = await generateToken();
    const query = req.body;
    const data = await fetchRTBResults(query,token.response.access_token);
    res.json(data);
})

module.exports = router
