const express = require('express');
const router = express.Router();
const axios = require('axios');
const Logger = require("../../logger/logger");

const generateToken = async()=>{

    let config = {
        method: 'get',
        url: 'https://gardian.api.dev2.scio.services/api/generatetoken',
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


const getAnalytics = async(access_token)=>{
    let data = JSON.stringify({
        "key": "gardian_summaries"
    });

    let config = {
        method: 'post',
        url: 'https://gardian.api.dev2.scio.services/api/retrieveRedisValue',
        headers: {
            'Authorization': `Bearer ` + access_token,
            'Content-Type': 'application/json'
        },
        data: data
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

const getGardianSummary =  async(access_token)=>{

    let data = JSON.stringify({
        "key": "gardian_homepage"
    });

    let config = {
        method: 'post',
        url: 'https://gardian.api.dev2.scio.services/api/retrieveRedisValue',
        headers: {
            'Authorization': `Bearer ` + access_token,
            'Content-Type': 'application/json'
        },
        data : data
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

const getMetadata = async(data,access_token)=>{
    data.alias = "gardian_index";
    let dataRequest = JSON.stringify(data);
    let config = {
        method: 'post',
        url: 'https://gardian.api.dev2.scio.services/api/retrievedocument',
        headers: {
            'Authorization': `Bearer ` + access_token,
            'Content-Type': 'application/json'
        },
        data : dataRequest
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

const getResults = async(data,access_token)=>{
    let dataRequest = JSON.stringify(data);
    let config = {
        method: 'post',
        url: 'https://gardian.api.dev2.scio.services/api/querygardian',
        headers: {
            'Authorization': `Bearer ` + access_token,
            'Content-Type': 'application/json'
        },
        data : dataRequest
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


router.post("/search",async(req,res)=>{
    Logger.info("Search GARDIAN Catalogue: "+JSON.stringify(req.body));
    const token = await generateToken();
    const query = req.body;
    const data = await getResults(query,token.access_token).then((res)=>{return res});
    res.json(data);
})

router.post("/document",async(req,res)=>{
    Logger.info("Get Document "+JSON.stringify(req.body));
    const token = await generateToken();
    const query = req.body;
    const data = await getMetadata(query,token.access_token);
    res.json(data);
})

router.get("/summary",async(req,res)=>{
    Logger.info("Get Summary "+JSON.stringify(req.body));
    const token = await generateToken();
    const data = await getGardianSummary(token.access_token);
    res.json(data);
})

router.get("/analytics",async(req,res)=>{
    Logger.info("Get Analytics "+JSON.stringify(req.body));
    const token = await generateToken();
    const data = await getAnalytics(token.access_token);
    res.json(data);
})

module.exports = router
