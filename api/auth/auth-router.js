const router = require('express').Router();
const User = require('../users/users-model')
const bcrypt = require('bcryptjs')
const mw = require('../middleware/middleware')

router.post('/register', mw.checkPayload, mw.checkUserInDb, async (req, res) => {
 try{
    const hash = bcrypt.hashSync(req.body.password, 10)
    const newUser = await User.add({username: req.body.username, password: hash })
    res.status(201).json(newUser)
 } catch(error){
    res.status(500).json({message: error.message})
 }
});

router.post('/login', mw.checkPayload, mw.checkUserExists, (req, res) => {
  // res.end('implement login, please!');
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
 try{
   const verified = bcrypt.compareSync(req.body.password, req.userData.password)
   if(verified){
     req.user.session = req.userData
     res.status(200).json({message: `Welcome ${req.userData.username}`})
   }
 } catch(error){
   res.status(400).json({message: error.message})
 }
});

module.exports = router;
