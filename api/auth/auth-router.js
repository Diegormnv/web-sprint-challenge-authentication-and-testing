const router = require('express').Router();
const User = require('../users/users-model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { isValid } = require('../users/users-service');
const { jwtSecret } = require('../../config/secrets');

router.post('/register', (req, res) => {
   /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.
    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }
    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }
    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".
    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */
  const credentials = req.body

  if(isValid(credentials)){
    const rounds = process.env.BCRYPT_ROUNDS || 10
    const hash = bcrypt.hashSync(req.body.password, rounds)

    credentials.password = hash

    User.add(credentials)
    .then((user) =>{
      res.status(201).json(user)
    })
    .catch((error) =>{
      res.status(400).json({message: 'username taken'})
    })
  } else{
    res.status(400).json({message: 'username and password required'})
  }

});

router.post('/login', (req, res) => {
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.
    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }
    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }
    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".
    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */
  const { username, password } = req.body
 
  if(isValid(req.body)){
    User.findBy({username: username })
    .then(([user]) =>{
      if(user && bcrypt.compareSync(password, user.password)){
        const token = makeToken(user)

        res.status(200).json({
          message: `welcome, ${user.username}`,
          token
        })
      } else{
        res.status(400).json({message: 'invalid credentials'})
      }
    })
    .catch((error) =>{
      res.status(500).json({message: error.message})
    });
  } else{
    res.status(400).json({message: 'username and password required'})
  }
});

function makeToken(user){
  const payload ={
    subject: user.id,
    username: user.username,
  }
  const options ={
    expiresIn: '2h'
  }
  return jwt.sign(payload, jwtSecret, options) 
}

module.exports = router;
