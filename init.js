const path = require("path");

global.electron = require('electron');
let core = require("./core");

if(electron.app.isPackaged){
    global.__home__ = path.dirname(electron.app.getPath('exe'));
}else{
    global.__home__ = process.cwd();
}
module.exports = function(appName){

    let application = require("./"+appName);
    application.name=appName;

    electron.app.commandLine.appendSwitch('disable-pinch');
    electron.app.whenReady().then(function() {
        core.init(application);
    })
    electron.app.on('window-all-closed', function () {
        electron.app.quit()
    })
    electron.app.on("activate",function(){
        core.init(application);
    })

}

