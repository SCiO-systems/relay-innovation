const express = require('express');
const router = express.Router();
const axios = require('axios');
const logger = require("./logger/logger");

const fetchUser = async(data)=>{
    let config = {
        method: 'get',
        url: process.env.LOGIN_API+'/api/handleMelCode/' + data.data
    };

    return axios(config)
        .then(function (response) {
            return response.data;
        })
        .catch(function (error) {
            logger.log(
                {
                    message:error,
                    level:'error'
                }
            )
            logger.log(
                {
                    message:config,
                    level:'error'
                }
            )
            return error;
        });
}

router.post("/login",async(req,res)=>{
    const query = req.body;
    const data = await fetchUser(query);
    res.json(data);
})

router.get("/getCSRFToken",async(req,res)=>{
    res.json({ CSRFToken: req.CSRFToken() });
})

module.exports = router
