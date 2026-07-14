
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
        },
        openAddWindow:(window,request)=>{
            // 打开添加密码窗口
            window.dialog.load("add", {});
            request.success();
        },
        refreshList:(window,request)=>{
            // 刷新密码列表
            passwordHelper.readPwd().then(pwds=>{
                window.send("pwds",pwds);
                request.success();
            }).catch(e=>{
                request.fail(e.message || e);
            });
        }
    }
}
