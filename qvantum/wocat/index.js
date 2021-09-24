const express = require('express');
const router = express.Router();
const axios = require('axios');

const generateToken = async()=>{

    var config = {
        method: 'get',
        url: process.env.AGRONOMY_API+'/api/generatetoken',
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

const fetchWocatResults = async(data,access_token)=>{
    var dataRequest = JSON.stringify(data);
    var config = {
        method: 'post',
        url: process.env.AGRONOMY_API+'/api/technologies',
        headers: {
            'Authorization': `Bearer `+access_token,
            'Content-Type': 'application/json'
        },
        data : dataRequest
    };

    return axios(config)
        .then(function (response) {
            return response.data;
        })
        .catch(function (error) {
            return error;
        });

}

router.post("/search",async(req,res)=>{
    const token = await generateToken();
    const query = req.body;
    const data = await fetchWocatResults(query,token.access_token);
    res.json(data);
})

module.exports = router
