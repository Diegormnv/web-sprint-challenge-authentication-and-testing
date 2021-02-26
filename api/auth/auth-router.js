const router = require('express').Router();
const User = require('../users/users-model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { isValid } = require('../users/users-service');
const { jwtSecret } = require('../../config/secrets');

router.post('/register', (req, res) => {
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
      res.status(500).json({message: error.message})
    })
  } else{
    res.status(400).json({message: 'Please provide username and password'})
  }

});

router.post('/login', (req, res) => {
  const { username, password } = req.body
 
  if(isValid(req.body)){
    User.findBy({username: username })
    .then(([user]) =>{
      if(user && bcrypt.compareSync(password, user.password)){
        const token = makeToken(user)

        res.status(200).json({
          message: `Welcome back ${user.username}`,
          token
        })
      } else{
        res.status({message: 'Invalid credentials'})
      }
    })
    .catch((error) =>{
      res.status(500).json({message: error.message})
    });
  } else{
    res.status(400).json({message: 'Please provide username and password'})
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
