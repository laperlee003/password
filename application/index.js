let path = require("path");
let ExceptionHandel = require("./exception/handel");
let fileHelper = require("./helper/fileHelper");

module.exports = {
    option: {
        "center":true,
        "resizable":false,
        "backgroundColor":"#fff",
        "frame": false,
        "webPreferences":{
            "nodeIntegration": true,
            "contextIsolation": false
        }
    },
    global:{
        icon:path.join(__dirname,"resource","favicon.ico"),
        authRun:true,           //开机启动
    },
    tray:{
        icon:path.join(__dirname,"resource","favicon.ico"),
        menu:[
            {
                label:"退出",
                click:(win)=>{
                    win.destroy()
                }
            },
        ],
        toolTip:"密码管理工具"
    },
    
    init:(window)=>{
        if(fileHelper.getSecret()){
            window.go("index",{});
        }else{
            window.go("init",{});
        }
    },
    ExceptionHandel:(new ExceptionHandel()),
    method:{
        close:(window,request)=>{
            window.close();
        },
    }
}