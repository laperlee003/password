let electron = require('electron');
let page = require("../electronLee/page");
const window = require("../electronLee/window");
class dialog extends window{
    
    setParent(win){
        this.parent = win;
    }
    setParentMask(visible){
        if(this.parent && this.parent.webContents && !this.parent.webContents.isDestroyed()){
            this.parent.webContents.send("dialog-mask", visible);
        }
    }
    load(route,data){
        let option=this.option;
        option.show=false;
        option.parent=this.parent;
        option.modal=true;
        this.setParentMask(true);
        if(electron.globalShortcut.isRegistered("CommandOrControl+E")){
            electron.globalShortcut.unregister("CommandOrControl+E");
        }
        this.open(option).then((win)=>{
            win.on("closed",()=>{
                this.setParentMask(false);
            });
            electron.globalShortcut.register('CommandOrControl+E', ()=>{
                win.webContents.toggleDevTools();
            });
            this.loadPage(route,data);
        }).catch(()=>{
            this.setParentMask(false);
        });
    }
}

module.exports=dialog;
