let path = require("path");
let ExceptionHandel = require("./exception/handel");
let fileHelper = require("./helper/fileHelper");

module.exports = {
    option: {
        "center":true,
        "resizable":true,
        "minWidth": 900,
        "minHeight": 700,
        "transparent": true,
        "frame": false,
        "webPreferences":{
            "nodeIntegration": true,
            "enableRemoteModule": true,
            "contextIsolation": false
        }
    },
    icon:path.join(__dirname,"resource","favicon.ico"),
    tray:{
        icon:path.join(__dirname,"resource","favicon.ico"),
        menu:[
            {
                label:"关闭",
                click:function(win){
                    win.destroy()
                }
            },
        ],
        toolTip:"密码管理工具"
    },
    dialog:{
        option: {
            "center":true,
            "resizable":false,
            "transparent": true,
            "frame": false,
            "webPreferences":{
                "nodeIntegration": true,
                "enableRemoteModule": true,
                "contextIsolation": false
            }
        },
        method:{
            closeDialog:function(window,request){
                window.close();
            },
            close:function(window,request){
                window.close();
            },
        }
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