const express = require('express')
const mysql = require('mysql')
const session = require('express-session')
const bcrypt = require('bcrypt')
const multer = require('multer')
const dotenv = require('dotenv')
const nodemailer = require('nodemailer')

const app = express()

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

dotenv.config()

app.set('view engine', 'ejs')

app.use(express.static('public'))

app.use(express.urlencoded({ extended: true }))

app.use(express.json())

app.use(session({
    secret: 'c@!@$0m@',
    saveUninitialized: false,
    resave: true
}))

app.use((req, res, next) => {
    res.locals.isLogedIn = (req.session.userID !== undefined)
    next()
})

function loginRequired(req, res) {
    res.locals.isLogedIn || res.redirect('/login')
}

function generateid() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const randomCharacters = Array.from({ length: 10 }, () => characters.charAt(Math.floor(Math.random() * characters.length)))
    const genID = randomCharacters.join('')
    return genID
}

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/teachers-dashboard', (req, res) => {
    res.render('teachers-dashboard')
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

const PORT = process.env.PORT || 3009
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})