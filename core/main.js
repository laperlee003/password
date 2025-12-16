let window = require("../electronLee/window");

/**
 * 窗口类
 */
class main extends window{

    setDialog(dialog){
        this.dialog = dialog;
        this.dialog.setParent(this.win);
    }

    returnContents(event){
        event.returnValue=this.win.webContents;
    }


    /**加载页面 */
    go(route,data){
        this.loadPage(route,data);
    }

    /**打开对话框窗口 */
    openDialog(route,data){
        if(this.dialog){
            this.dialog.load(route,data);
        }
    }

}


module.exports=main