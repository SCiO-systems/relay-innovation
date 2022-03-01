
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

const corsOptions = {
    origin: process.env.ALLOWED_ORIGIN,
    credentials: true,
}

// router.use(cors(corsOptions));

router.use(cookieParser())

router.use('/static',express.static('public'))

var upload = multer({ storage: storage })

router.post('/api/upload',upload.single('file') ,function(req, res) {
    console.log(req.file)
    res.send('')
});

router.get('/form', csrfProtection, (req, res) => {
    console.log(req)
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
    });

    fetch('https://api.mel.cgiar.org/v3/auth', {
        method: 'POST',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: raw
    })
        .then(result => {
            return result.json()
        })
        .catch(err => console.warn(1))
        .then(result => {
            return res.send(result.access_token)
        })
        .catch(err => console.warn(2))
})

router.post('/api/melLogin/userData' , csrfProtection,async (req,res) => {


    const accessToken = req.body.accessToken
    console.log(accessToken)

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
    console.log(id)

    fetch(`${apiUrl}/api/user/${id}/exists`, {
        method: 'GET',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
    })
        .then( async result => {
            const response = await result.json()
            if (response.exists) {
                await fetch(`${apiUrl}/api/user/${id}/data`, {
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
                await fetch(`${apiUrl}/api/user/${id}/new`, {
                    method: 'POST',
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                    body: {
                        user_id: `${id}`
                    }
                })
                    .then( async result => {
                        const response = await result.json()
                        if (response.result === 'ok') {
                            await fetch(`${apiUrl}/api/user/${id}/data`, {
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
            // console.log(await result.json())
        })
        .catch(err => console.log(err))
})

router.post('/api/admin/update/permissions',csrfProtection, async (req,res) => {

    const id = req.body.user_id
    console.log(id)
    const targetId = req.body.targetid
    const permissions = req.body.permissions
    console.log(permissions.split(','))
    const body = {
        user_id: `${id}`,
        permissions: permissions.split(','),
        targetId:targetId
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
            console.log(await result.json())
        })
        .catch(err => console.log(err))
})

router.post('/api/user/getInnovations',csrfProtection, async (req,res) => {

    const id = req.body.user_id

    fetch(`${apiUrl}/api/user/${id}/getInnovations`, {
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

router.post('/api/user/getAssignedReviews',csrfProtection, async (req,res) => {

    const id = req.body.user_id

    fetch(`${apiUrl}/api/user/${id}/getAssignedReviews`, {
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

router.post('/api/innovation/insert',csrfProtection, async (req,res) => {

    const id = req.body.user_id
    let form_data = req.body.form_data
    const status = req.body.status
    const body = {
        user_id: `${id}`,
        form_data: JSON.parse(form_data),
        status: `${status}`
    }

    fetch(`${apiUrl}/api/innovation/insert`, {
        method: 'POST',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
    })
        .then(async result => {
            console.log(await result.json())
            // return res.send(await result.json())
        })
        .catch(err => console.log(err))
})

router.post('/api/innovation/edit',csrfProtection, async (req,res) => {

    const form_data = req.body.form_data
    const id = req.body.user_id
    const innovation_id = req.body.innovation_id
    const status = req.body.status
    const body = {
        user_id: `${id}`,
        form_data: JSON.parse(form_data),
        innov_id: `${innovation_id}`,
        status: status
    }

    console.log(body)

    fetch(`${apiUrl}/api/innovation/${innovation_id}/edit`, {
        method: 'PATCH',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
    })
        .then(async result => {
            console.log(await result.json())
        })
        .catch(err => console.log(err))
})

router.post('/api/innovation/delete',csrfProtection, async (req,res) => {

    const id = req.body.user_id
    const innovation_id = req.body.innovation_id

    console.log(innovation_id)

    fetch(`${apiUrl}/api/innovation/${innovation_id}/delete/${id}`, {
        method: 'DELETE',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
    })
        .then(async result => {
            console.log(await result.json())
        })
        .catch(err => console.log(err))
})

router.post('/api/innovation/submit',csrfProtection, async (req,res) => {

    const id = req.body.user_id
    const innovation_id = req.body.innovation_id
    const body = {
        user_id: `${id}`,
        innov_id: `${innovation_id}`,
    }

    fetch(`${apiUrl}/api/innovation/${innovation_id}/submit`, {
        method: 'PATCH',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
    })
        .then(async result => {
            console.log(await result)
        })
        .catch(err => console.log('hi'))
})

router.post('/api/innovation/updateVersion',csrfProtection, async (req,res) => {

    const id = req.body.user_id
    const innovation_id = req.body.innovation_id
    const status = req.body.status
    const form_data = req.body.form_data
    const version = req.body.version
    const body = {
        user_id: `${id}`,
        innovation_id: `${innovation_id}`,
        status: `${status}`,
        form_data: form_data,
        version: version
    }

    fetch(`${apiUrl}/api/innovation/${innovation_id}/updateVersion`, {
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

router.post('/api/innovation/publish',csrfProtection, async (req,res) => {

    const id = req.body.user_id
    const innovation_id = req.body.innovation_id
    const body = {
        user_id: `${id}`,
        innovation_id: `${innovation_id}`,
    }

    fetch(`${apiUrl}/api/innovation/${innovation_id}/publish`, {
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

router.post('/api/innovation/reject',csrfProtection, async (req,res) => {

    const id = req.body.user_id
    const innovation_id = req.body.innovation_id
    const comments = req.body.comments
    const body = {
        user_id: `${id}`,
        innovation_id: `${innovation_id}`,
        comments: comments.split(','),
    }

    fetch(`${apiUrl}/api/innovation/${innovation_id}/reject`, {
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

router.post('/api/admin/getInnovations',csrfProtection, async (req,res) => {

    const id = req.body.user_id

    fetch(`${apiUrl}/api/admin/${id}/getInnovations`, {
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
    const body = {
        user_id: `${id}`,
        innovation_id: `${innovation_id}`,
        reviewer_ids: reviewer_ids.split(','),
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

router.post('/api/clarisaResults',csrfProtection, async (req,res) => {

    fetch(`${apiUrl}/api/clarisaResults`, {
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

router.get('/api/posts/:id', csrfProtection, (req,res) => {
    res.send(req.params.id);
})

module.exports = router

// export default router
