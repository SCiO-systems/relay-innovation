const express = require('express');
const router = express.Router();
const axios = require('axios');

const generateToken = async()=>{

    var config = {
        method: 'get',
        url: 'https://agronomy.api.dev2.scio.services/api/generatetoken',
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

const fetchAgrovocSuggestions = async(data,access_token)=>{
    var dataRequest = JSON.stringify(data);

    var config = {
        method: 'get',
        url: 'https://agronomy.api.dev2.scio.services/api/agrovoc',
        headers: {
            'Authorization': `Bearer `+access_token,
            'Content-Type': 'application/json'
        },
        data : dataRequest
    };

    return axios(config)
        .then(function (response) {
            return response.data[0];
        })
        .catch(function (error) {
            return error;
        });

}

const fetchCountriesSuggestions = async(data,access_token)=>{

    //should be fixed
    data.country = data.autocomplete;

    var dataRequest = JSON.stringify(data);

    var config = {
        method: 'get',
        url: 'https://agronomy.api.dev2.scio.services/api/countries',
        headers: {
            'Authorization': `Bearer `+access_token,
            'Content-Type': 'application/json'
        },
        data : dataRequest
    };

    return axios(config)
        .then(function (response) {
            return response.data[0];
        })
        .catch(function (error) {
            return error;
        });

}

router.post("/agrovoc",async(req,res)=>{
    const token = await generateToken();
    const query = req.body;
    const data = await fetchAgrovocSuggestions(query,token);
    res.json(data);
})


router.post("/countries",async(req,res)=>{
    const token = await generateToken();
    const query = req.body;
    const data = await fetchCountriesSuggestions(query,token);
    res.json(data);
})

module.exports = router
