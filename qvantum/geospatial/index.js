const express = require('express');
const router = express.Router();
const axios = require('axios');


const fetchDatasetData = async(data)=>{
    var dataRequest = JSON.stringify(data);

    var config = {
        method: 'POST',
        url: 'https://geoc.api.dev2.scio.services/api/getvariables',
        headers: {
            'Authorization': `Bearer ${process.env.GEO_API_KEY}`,
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

const fetchGeotiff = async(data)=>{
    var config = {
        method: 'GET',
        url: data.source,
        headers: {
            'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
    };

    return axios(config)
        .then(function (response) {
            return response.data;
        })
        .catch(function (error) {
            return error;
        });

}

router.post("/geotiff",async(req,res)=>{
    const query = req.body;
    const data = await fetchGeotiff(query);
    res.send(data.toString('base64'));
})

router.post("/variables",async(req,res)=>{
    const query = req.body;
    const data = await fetchDatasetData(query);
    res.json(data);
})

module.exports = router
