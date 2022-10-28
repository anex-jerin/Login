if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')

const initializePassport = require('./passport-config')
initializePassport(
  passport,
  (email) => users.find((user) => user.email === email),
  (id) => users.find((user) => user.id === id)
)
/* create hashed password */

const users = []
/* setting up ejs view-engine */
app.set('view-engine', 'ejs')
/* adding static files */
app.use(express.static('views'))
/* get form data, and get access on the post method */
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
)
app.use(passport.session())

app.get('/', checkAuthenticated, (req, res) => {
  res.render('index.ejs',{name:req.user.name})
})

/* get request for login page */
app.get('/login',checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})
/* post request for login page */
app.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
  })
)

/* get request for register page */
app.get('/register',checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})

/* post request for register page */
app.post('/register',checkNotAuthenticated, async (req, res) => {
  /* corresponds to the name in the form field we get the value in here, eg: req.body.name, req.body.email, req.body.password  */
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    users.push({
      id: new Date().getTime().toString(),
      name: req.body.name,
      password: hashedPassword,
      email: req.body.email,
    })

    res.redirect('/login')
  } catch (error) {
    res.redirect('/register')
  }
  console.log(users)
})
function checkAuthenticated(req,res, next){
  if(req.isAuthenticated()){
    return next()
  }
  res.redirect('/login')
}
function checkNotAuthenticated(req,res,next){
  if(req.isAuthenticated()){
    return res.redirect('/')
  }
  next()
}
app.listen(3000, () => {
  console.log('listening to port 3000')
})
