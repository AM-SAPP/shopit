const { sign, verify } = require("jsonwebtoken");
const config = require('./config');
const createTokens = (user) => {
  const accessToken = sign( { username: user.username, id: user._id }, config.secretKey );
  return accessToken;
};

const validateToken = (req, res, next) => {
  const accessToken = req.cookies["access-token-myntra"];
  if (!accessToken)
    return res.status(400).json({ error: "User not Authenticated!" });
  try {
    const validToken = verify(accessToken, "jwtsecretplschange");
    if (validToken) {
      req.authenticated = true;
      return next();
    }
  } catch (err) {
    return res.status(400).json({ error: err });
  }
};

module.exports = { createTokens, validateToken };
