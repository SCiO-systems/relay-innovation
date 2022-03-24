
const fetch = require('node-fetch')
const cors = require('cors')
require('dotenv/config')
const bodyParser = require('body-parser')
const express = require('express')
const csrf = require('csurf')
const cookieParser = require('cookie-parser')
const multer = require('multer')

// import cookieParser from 'cookie-parser'
// import csrf from 'csurf'
// import bodyParser from 'body-parser'
// import express from 'express'
// import 'dotenv/config'
// import cors from 'cors'
// import fetch from 'node-fetch';
// import multer from 'multer'

const apiUrl = process.env.API_URL

var csrfProtection = csrf({ cookie: true })

var parseForm = bodyParser.urlencoded({ extended: false })

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './static')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname )
    }
})

// var router = express()
const router = express.Router();

router.use(cookieParser())

router.use('/static',express.static('public'))

var upload = multer({ storage: storage })

router.post('/api/upload',upload.single('file') ,function(req, res) {
    console.log(req.body)
    res.send('success')
});

router.get('/form', csrfProtection, (req, res) => {
    res.send({csrfToken: req.csrfToken() })
})

router.post('/process', parseForm, csrfProtection, (req, res) => {
    res.send('data is being processed')
})

router.post('/api/melLogin/accessToken', csrfProtection, async (req,res) => {

    const code = req.body.code

    let raw = JSON.stringify({
        "client_id": process.env.CLIENT_ID,
        "client_secret": process.env.CLIENT_SECRET,
        "code": code
        // "code": "d80a8d4da986bc47de2bc7c376bb0abd"
    });

    fetch('https://api.mel.cgiar.org/v3/auth', {
        method: 'POST',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: raw
    })
        .then(async result => {
            const response = await result.json()
            res.send(response.access_token)
        })
        .catch(err => console.warn(2))
})

router.post('/api/melLogin/userData' , csrfProtection,async (req,res) => {


    const accessToken = req.body.accessToken

    fetch('https://api.mel.cgiar.org/v3/auth/me', {
        method: 'GET',
        headers: {
            "Authorization": "Bearer " + accessToken,
        },
        redirect: 'follow'
    })
        .then(result => {
            return result.json()
        })
        .catch(err => {
            console.log(3)
            res.write('Access Token has expired')
            res.end()
        })
        .then(result => {

            return res.send(result)
        })
        .catch(err => console.warn(4))
})

router.post('/api/user/getUserData',csrfProtection,(req,res) => {

    const id = req.body.user_id

    fetch(`${apiUrl}/api/user/${id}/exists`, {
        method: 'GET',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
    })
        .then( async result => {
            const response = await result.json()
            const userId = response.data.user_id
            const data = response.data

            if (response.exists) {
                await fetch(`${apiUrl}/api/user/${userId}/data`, {
                    method: 'GET',
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                })
                    .then(async result => {
                        return res.send(await result.json())
                    })
                    .catch(err => console.log(err))
            } else {

                await fetch(`${apiUrl}/api/user/${userId}/new`, {
                    method: 'POST',
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data)
                })
                    .then( async result => {
                        const response = await result.json()
                        if (response.result === 'ok') {
                            await fetch(`${apiUrl}/api/user/${userId}/data`, {
                                method: 'GET',
                                headers: {
                                    Accept: "application/json",
                                    "Content-Type": "application/json",
                                },
                            })
                                .then(async result => {
                                    return res.send(await result.json())
                                })
                                .catch(err => console.log(err))
                        } else {
                            return res.send({result: response.errorMessage?.user_id?.map(item => {
                                    return item
                                }) })
                        }
                    })
                    .catch(err => console.log(err))
            }

        })
        .catch(err => {
            console.log(err)
        })
})

router.post('/api/user/update/role',csrfProtection, async (req,res) => {

    const id = req.body.user_id
    const role = req.body.role

    const body = {
        user_id: `${id}`,
        role: `${role}`
    }

    fetch(`${apiUrl}/api/user/${id}/update/role`, {
        method: 'PATCH',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
    })
        .then(async result => {
            return res.send(await result.json())
        })
        .catch(err => console.log(err))
})

router.post('/api/user/wocat',csrfProtection, async (req,res) => {

    const id = req.body.user_id
    const username = req.body.username
    const password = req.body.password

    const body = {
        user_id: `${id}`,
        wocat_credentials: {
            username: username,
            password: password
        }
    }

    fetch(`${apiUrl}/api/user/${id}/wocat`, {
        method: 'PATCH',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
    })
        .then(async result => {
            console.log( await result.json())
            // return res.send(await result.json())
        })
        .catch(err => console.log(err))
})

router.post('/api/admin/update/permissions',csrfProtection, async (req,res) => {

    const id = req.body.user_id
    const target_id = req.body.target_id
    const permissions = req.body.permissions
    const body = {
        user_id: `${id}`,
        permissions: permissions,
        target_id:target_id
    }

    fetch(`${apiUrl}/api/admin/${id}/update/permissions`, {
        method: 'PATCH',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
    })
        .then(async result => {
            return res.send(await result.json())
        })
        .catch(err => console.log(err))
})

router.post('/api/user/resources',csrfProtection, async (req,res) => {

    const id = req.body.user_id

    fetch(`${apiUrl}/api/user/${id}/resources`, {
        method: 'GET',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        }
    })
        .then(async result => {
            return res.send(await result.json())
        })
        .catch(err => console.log(err))

})

router.post('/api/user/getAssignedResources',csrfProtection, async (req,res) => {

    const id = req.body.user_id

    fetch(`${apiUrl}/api/user/${id}/assignedResources`, {
        method: 'GET',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
    })
        .then(async result => {
            return res.send(await result.json())
        })
        .catch(err => console.log(err))
})

router.post('/api/resources/insert',csrfProtection, async (req,res) => {

    const id = req.body.user_id
    let form_data = req.body.form_data
    const status = req.body.status
    const type = req.body.type
    console.log(type)
    const body = {
        user_id: `${id}`,
        form_data: JSON.parse(form_data),
        status: `${status}`,
        type:type
    }

    fetch(`${apiUrl}/api/resources/new`, {
        method: 'POST',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
    })
        .then(async result => {
            // return res.send(await result.json())
            console.log(await result.json())
        })
        .catch(err => console.log(err))
})

router.post('/api/resources/edit',csrfProtection, async (req,res) => {

    const form_data = req.body.form_data
    const id = req.body.user_id
    const resource_id = req.body.resource_id
    const status = req.body.status
    const body = {
        user_id: `${id}`,
        form_data: JSON.parse(form_data),
        resource_id: `${resource_id}`,
        status: status
    }

    console.log(body)

    fetch(`${apiUrl}/api/resources/${resource_id}/edit`, {
        method: 'PATCH',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
    })
        .then(async result => {
            return res.send(await result.json())
        })
        .catch(err => console.log(err))
})

router.post('/api/resources/delete',csrfProtection, async (req,res) => {

    const id = req.body.user_id
    const resource_id = req.body.resource_id

    fetch(`${apiUrl}/api/resources/${resource_id}/delete/${id}`, {
        method: 'DELETE',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
    })
        .then(async result => {
            return res.send(await result.json())
        })
        .catch(err => console.log(err))
})

router.post('/api/resources/submit',csrfProtection, async (req,res) => {

    const id = req.body.user_id
    const resource_id = req.body.resource_id

    const body = {
        user_id: `${id}`,
        resource_id: `${resource_id}`,
    }

    fetch(`${apiUrl}/api/resources/${resource_id}/submit`, {
        method: 'PATCH',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
    })
        .then(async result => {
            return res.send(await result.json())
        })
        .catch(err => console.log('hi'))
})

router.post('/api/resources/publish',csrfProtection, async (req,res) => {

    const id = req.body.user_id
    const resource_id = req.body.resource_id
    const body = {
        user_id: `${id}`,
        resource_id: `${resource_id}`,
    }

    fetch(`${apiUrl}/api/resources/${resource_id}/publish`, {
        method: 'PATCH',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
    })
        .then(async result => {
            return res.send(await result.json())
        })
        .catch(err => console.log(err))
})

router.post('/api/resources/reject',csrfProtection, async (req,res) => {

    const id = req.body.user_id
    const resource_id = req.body.resource_id
    const comments = req.body.comments
    const body = {
        user_id: `${id}`,
        resource_id: `${resource_id}`,
        comments: `${comments}`,
    }

    fetch(`${apiUrl}/api/resources/${resource_id}/reject`, {
        method: 'PATCH',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
    })
        .then(async result => {
            return res.send(await result.json())
        })
        .catch(err => console.log(err))
})

router.post('/api/resources/addComment',csrfProtection, async (req,res) => {

    const id = req.body.user_id
    const resource_id = req.body.resource_id
    const comments = req.body.comments
    const body = {
        user_id: `${id}`,
        resource_id: `${resource_id}`,
        comments: `${comments}`,
    }

    fetch(`${apiUrl}/api/resources/${resource_id}/addComment`, {
        method: 'PATCH',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
    })
        .then(async result => {
            return res.send(await result.json())
        })
        .catch(err => console.log(err))
})

router.post('/api/admin/getAllUsers',csrfProtection, async (req,res) => {

    const id = req.body.user_id

    fetch(`${apiUrl}/api/admin/${id}/users/data`, {
        method: 'GET',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
    })
        .then(async result => {
            return res.send(await result.json())
        })
        .catch(err => console.log(err))

})

router.post('/api/admin/getResources',csrfProtection, async (req,res) => {

    const id = req.body.user_id

    fetch(`${apiUrl}/api/admin/${id}/resources`, {
        method: 'GET',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
    })
        .then(async result => {
            return res.send(await result.json())
        })
        .catch(err => console.log(err))

})

router.post('/api/admin/getReviewers',csrfProtection, async (req,res) => {

    const id = req.body.user_id

    fetch(`${apiUrl}/api/admin/${id}/getReviewers`, {
        method: 'GET',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
    })
        .then(async result => {
            return res.send(await result.json())
        })
        .catch(err => console.log(err))

})

router.post('/api/admin/assignReviewer',csrfProtection, async (req,res) => {

    const id = req.body.user_id
    const resource_id = req.body.resource_id
    const reviewer_id = req.body.reviewer_id
    console.log(reviewer_id)
    const body = {
        user_id: `${id}`,
        resource_id: `${resource_id}`,
        reviewer_id: `${reviewer_id}`,
    }

    fetch(`${apiUrl}/api/admin/${id}/assignReviewer`, {
        method: 'PATCH',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
    })
        .then(async result => {
            return res.send(await result.json())
        })
        .catch(err => console.log(err))

})

router.post('/api/admin/users/dataPaginated',csrfProtection, async (req,res) => {

    const id = req.body.user_id
    const offset = req.body.offset
    const limit = req.body.limit

    const body = {
        user_id: `${id}`,
        offset: offset,
        limit: limit,
    }

    fetch(`${apiUrl}/api/admin/${id}/users/dataPaginated`, {
        method: 'POST',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
    })
        .then(async result => {
            return res.send(await result.json())
        })
        .catch(err => console.log(err))

})

router.post('/api/resources/autocomplete',csrfProtection, async (req,res) => {

    const autocomplete = req.body.autocomplete

    const body = {
        autocomplete:autocomplete
    }

    fetch(`${apiUrl}/api/resources/autocomplete`, {
        method: 'POST',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
    })
        .then(async result => {
            return res.send(await result.json())
        })
        .catch(err => console.log(err))
})

router.post('/api/user/name/autocomplete',csrfProtection, async (req,res) => {

    const autocomplete = req.body.autocomplete

    const body = {
        autocomplete:autocomplete
    }

    fetch(`${apiUrl}/api/user/name/autocomplete`, {
        method: 'POST',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
    })
        .then(async result => {
            return res.send(await result.json())
        })
        .catch(err => console.log(err))
})

router.post('/api/reviewer/name/autocomplete',csrfProtection, async (req,res) => {

    const autocomplete = req.body.autocomplete

    const body = {
        autocomplete:autocomplete
    }

    fetch(`${apiUrl}/api/reviewer/name/autocomplete`, {
        method: 'POST',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
    })
        .then(async result => {
            return res.send(await result.json())
        })
        .catch(err => console.log(err))
})

router.post('/api/geospatial/polyStats',csrfProtection, async (req,res) => {

    const geometry = req.body.geoJson.geometry

    const body = {
        target: geometry
    }

    fetch(`${apiUrl}/api/geospatial/polyStats`, {
        method: 'POST',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
    })
        .then(async result => {
            const temp = await result.json()
            console.log(temp)
            return res.send(temp)
        })
        .catch(err => console.log(err))
})


module.exports = router

// export default router
