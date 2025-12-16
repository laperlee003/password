let electron = require('electron');
let page = require("../electronLee/page");
const window = require("../electronLee/window");
class dialog extends window{
    
    setParent(win){
        this.parent = win;
    }
    load(route,data){
        let option=this.option;
        option.show=false;
        option.parent=this.parent;
        option.modal=true;
        if(electron.globalShortcut.isRegistered("CommandOrControl+E")){
            electron.globalShortcut.unregister("CommandOrControl+E");
        }
        this.open(option).then((win)=>{
            electron.globalShortcut.register('CommandOrControl+E', ()=>{
                win.webContents.toggleDevTools();
            });
            this.loadPage(route,data);
        });
    }
}

module.exports=dialog;