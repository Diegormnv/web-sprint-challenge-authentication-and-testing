module.exports = {
    isValid,
  };
  
  function isValid(user) {
   console.log(Boolean(user.username && user.password && typeof user.password === 'string'))
    return Boolean(user.username && user.password && typeof user.password === 'string');
  }