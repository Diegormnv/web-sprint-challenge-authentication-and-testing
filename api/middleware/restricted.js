module.exports = (req, res, next) => {
 try{
  if(req.session && req.session.user){
    next()
  } else {
    res.status(401).json({message: 'token required'})
  }
 } catch (error){
    res.status(401).json({message: 'token invalid'})
 }
};
