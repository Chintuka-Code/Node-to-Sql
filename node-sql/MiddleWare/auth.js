const jwt = require('jsonwebtoken');
const jwt_decode = require('jwt-decode');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').split(' ')[1];
    const verify = await jwt.verify(token, process.env.Token_key);
    if (verify) {
      req.body.current_user = jwt_decode(token).email;
      next();
    } else {
      res.status(403).json({ err: 1, message: 'Bad Authentication' });
    }
  } catch (error) {
    res.status(404).json({ err: 1, message: 'Not a Valid Token' });
  }
};

module.exports = auth;
