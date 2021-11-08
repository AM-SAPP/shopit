const axios = require('axios');

const signup = ()=> axios({
    method: 'post',
    url: 'https://apiforapp.herokuapp.com/api/users/signup',
    data : {
        name: 'pratyush',
        username : 'pratyush1234',
        password : '1234'
    }
})
.then((res)=>{
    console.log(res);
})
.catch(err=>{
    console.log(err);
})

module.exports = {signup}