let AlertException = require("./../../exception/AlertException");
let passwordHelper = require("./../../helper/passwordHelper");

module.exports = {
    load:(window,data)=>{
    },
    unload:()=>{
        
    },
    method:{
        submit:(window,request)=>{
            if(request.data.secret==""){
                throw new AlertException("请填写密钥");
            }
            // 为了安全，始终不记住密钥
            passwordHelper.setSecret(request.data.secret, false);
            window.go("index");
        }
    }
}