var express = require('express');
var router = express.Router();
const User = require('../models/user');
const {createTokens , validateToken} = require('../authenticate');
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");


router.use(express.json());
router.use(express.urlencoded({extended: true}));
router.use(cookieParser());


router.post('/signup',async (req,res,next)=>{
  const { username, password } = req.body;
  const user = await User.findOne({username : username });
  if(user){
    return res.status(400).json("Username already exist")
  }
  bcrypt.hash(password, 10).then((hash) => {
    User.create({
      username: username,
      password: hash,
      name : req.body.name
    })
      .then(() => {
        res.status(200).json("USER REGISTERED");
      })
      .catch((err) => {
        if (err) {
          res.status(400).json({ error: err });
        }
      });
  });
});


router.post('/login',async (req,res)=>{
  const { username, password } = req.body;

  const user = await User.findOne({ username: username  });

  if (!user) res.status(400).json({ error: "User Doesn't Exist" });

  const dbPassword = user.password;
  bcrypt.compare(password, dbPassword).then((match) => {
    if (!match) {
      res
        .status(400)
        .json({ error: "Wrong Username and Password Combination!" });
    } else {
      const accessToken = createTokens(user);

      res.cookie("access-token-myntra", accessToken, {
        maxAge: 60 * 60 * 24 * 1000,
        httpOnly: true,
      });

      res.json("LOGGED IN");
    }
  });
});

router.get('/logout',(req,res)=>{
    res.clearCookie('access-token-myntra')
    res.redirect('/');
})


module.exports = router;
