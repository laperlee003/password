
let fileHelper = require("../../helper/fileHelper");
let AlertException = require("./../../exception/AlertException");
let path = require("path");
let passwordHelper = require("./../../helper/passwordHelper");
module.exports = {
    load:(window,data)=>{
        passwordHelper.readPwd().then(pwds=>{
            window.send("pwds",pwds);
        }).catch(e=>{
            throw new AlertException(e);
        })
    },
    unload:()=>{
        passwordHelper.flush();
    },
    method:{
        submit:(window,request)=>{
            if(!request.data.name){
                request.fail("请填写名称");
                return ;
            }
            if(!request.data.account){
                request.fail("请填写账号");
                return ;
            }
            if(!request.data.pwd){
                request.fail("请填写密码");
                return ;
            }
            let exsit = passwordHelper.getByName(request.data.name);
            if(exsit){
                request.fail("名称已存在");
                return ;
            }
            passwordHelper.savePwd(request.data.name,request.data.account,request.data.pwd);
            request.success();
        },
        copy:(window,request)=>{
            electron.clipboard.writeText(request.data, 'tmp');
            request.success();
        },
        del:(window,request)=>{
            passwordHelper.deletePwd(request.data);
            request.success();
        },
        init:(window)=>{
            window.go("init");
        }
    }
}
