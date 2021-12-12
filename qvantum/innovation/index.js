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

    return await axios(config)
        .then(function (response) {
            return response.data;
        })
        .catch(function (error) {
            Logger.error("AUTH0: "+JSON.stringify(error));
            return error;
        });

}

const fetchRTBResults = async(data,access_token)=>{
    let dataRequest = JSON.stringify(data);
    let config = {
        method: 'post',
        url: process.env.AGRONOMY_API + '/api/rtb-search',
        headers: {
            'Authorization': `Bearer ` + access_token,
            'Content-Type': 'application/json'
        },
        data: dataRequest
    };

    return await axios(config)
        .then(function (response) {
            return response.data;
        })
        .catch(function (error) {
            Logger.error(JSON.stringify(error.response.data));
            Logger.error("AXIOS CONFIG: "+JSON.stringify(config));
            return error;
        });

}


const fetchDocument = async(data,access_token)=>{
    let dataRequest = JSON.stringify(data);
    let config = {
        method: 'post',
        url: process.env.AGRONOMY_API + '/api/retrievedocument',
        headers: {
            'Authorization': `Bearer ` + access_token,
            'Content-Type': 'application/json'
        },
        data: dataRequest
    };

    return await axios(config)
        .then(function (response) {
            return response.data;
        })
        .catch(function (error) {
            Logger.error(JSON.stringify(error));
            Logger.error("AXIOS CONFIG: "+JSON.stringify(config));
            return error;
        });

}

const fetchDocumentByTitle = async(data,access_token)=>{
    let dataRequest = JSON.stringify(data);
    let config = {
        method: 'post',
        url: process.env.AGRONOMY_API + '/api/rtb-retrieveByTitle',
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
    Logger.info("Search Innovation Catalogue: "+JSON.stringify(token));
    const query = req.body;
    const data = await fetchRTBResults(query,token.access_token).then((res)=>{return res});
    res.json(data);
})

router.post("/document",async(req,res)=>{
    Logger.info("Get Document "+JSON.stringify(req.body));
    const token = await generateToken();
    const query = req.body;
    const data = await fetchDocument(query,token.access_token);
    res.json(data);
})

router.post("/documenttitle",async(req,res)=>{
    Logger.info("Get Document by Title "+JSON.stringify(req.body));
    const token = await generateToken();
    const query = req.body;
    const data = await fetchDocument(query,token.access_token);
    res.json(data);
})

module.exports = router
