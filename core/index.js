let main = require("./main");
let dialog = require("./dialog");

class laperlee{
    init(application){
        //初始化主窗口
        let applicationWindow = (new main(application));
        applicationWindow.open().then((win)=>{
            application.init(applicationWindow);
            electron.globalShortcut.register('CommandOrControl+D', ()=>{
                win.webContents.toggleDevTools();
            });
        });

        //增加激活监听
        electron.app.on('activate', function () {
            if (electron.BrowserWindow.getAllWindows().length === 0){
                application.init(applicationWindow);
            }
        });
        //监听一场捕获
        process.on("unhandledRejection",error=>{
            console.log(error);
            application.ExceptionHandel.on(applicationWindow,error);
        });
        //检查启动参数 是否启动后进入托盘模式
        let isHidden = process.argv.findIndex(function(arg){
            return arg=="--hidden";
        });
        if(isHidden!=-1){
            applicationWindow.tray();
        }

        let dialogOption = application.dialog;
        dialogOption.option = application.option;
        dialogOption.icon = application.icon;
        dialogOption.name = application.name;
        let dialogWindow = new dialog(dialogOption);
        applicationWindow.setDialog(dialogWindow);
    }
}
let lee = new laperlee();


module.exports = lee