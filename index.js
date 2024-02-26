const express = require('express')
const mysql = require('mysql')
const session = require('express-session')
const bcrypt = require('bcrypt')
const multer = require('multer')
const dotenv = require('dotenv')
const nodemailer = require('nodemailer')

const app = express()

app.set('view engine', 'ejs')

app.use(express.static('public'))

app.use(express.urlencoded({ extended: true }))

app.use(express.json())

app.use(session({
    secret: 'c@!@$0m@',
    saveUninitialized: false,
    resave: true
}))

dotenv.config()

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'calasoma'
})

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/profile')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})

const upload = multer({ storage: storage })

app.use((req, res, next) => {
    res.locals.isLogedIn = (req.session.userID !== undefined)
    next()
})

function loginRequired(req, res) {
    res.locals.isLogedIn || res.redirect('/login')
}

const offensiveWords = ['FUCK', 'SHIT', 'ASSHOLE', 'BITCH', 'DICK', 'CUNT', 'COCK', 'PUSSY', 'SLUT', 'WHORE', 'FAGGOT', 'MOTHERFUCKER', 'NIGGER', 'RETARD', 'TWAT', 'WANKER', 'ASSWIPE', 'BASTARD', 'DAMN', 'GODDAMN', 'ARSE', 'BOLLOCKS', 'BULLSHIT', 'CRAP', 'JACKASS', 'JERK', 'PISS',  'PRICK', 'SCREW', 'SUCK', 'TITS', 'ASSCLOWN', 'DUMBASS', 'FUCKER', 'SHITHEAD', 'ASSFACE', 'ASSHAT', 'CUM', 'DICKHEAD', 'ASSBAG', 'DIPSHIT', 'FUCKFACE', 'MOTHERFUCKING', 'NIGGA',  'SHITHOLE', 'ASSNUGGET', 'BASTARD', 'BLOWJOB', 'COCKSUCKER', 'CUMSLUT', 'DICKBAG', 'DICKWEED', 'DOUCHEBAG', 'FUCKTARD', 'JACKOFF', 'JIZZ', 'MOTHERFUCK', 'NIGGERS', 'PRICKFACE', 'SHITBAG', 'SHITSTAIN', 'TITFUCK', 'WANKSTAIN']

function generateId() {
    const characters = 'ABCDEFGHKMNPQRSTUVWXYZ23456789'
    let genId
    do {
        const randomCharacters = Array.from({ length: 5 }, () => characters.charAt(Math.floor(Math.random() * characters.length)))
        genId = randomCharacters.join('')
    } while (offensiveWords.some(word => genId.includes(word)))
    
    return genId
}

const config = {
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
}

const sendMail = (data) => {
    const transporter = nodemailer.createTransport(config)
    transporter.sendMail(data, (error, info) => {
        if (error) {
            console.log(error)
        } else {
            console.log('Email sent: ' + info.response)
        }
    })
}
app.get('/', (req, res) => {
    res.render('index')
})

app.get('/login', (req, res) => {
    const user = { 
        email: 'enshikuku@gmail.com', 
        password: '' 
    }
    res.render('login', { user, error: false })
})

app.post('/login', async (req, res) => {
    const { email, subject, text } = req.body
    const mailData = {
        from: process.env.EMAIL,
        to: email,
        subject: subject || 'Default Subject',
        text: text || 'Default Text'
    }

    sendMail(mailData)
    res.redirect('/login')
})

app.get('/logout', (req, res) => {
    loginRequired(req, res)
    req.session.destroy((err) => {
        res.redirect('/')
    })
})

app.get('*', (req, res) => {
    res.render('404')
})

const PORT = process.env.PORT || 3004
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})