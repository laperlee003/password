let message = require("./message");
let page = require("./page");

/**
 * 窗口类
 */
class window{
    /**
     * @param {*} application 
     * String name 应用面
     * Object option 启动参数
     * String icon icon图标文件
     * Object tray   托盘配置
     * Object method 全局方法
     */
    constructor(application){
        this.name = application.name;           //应用名
        this.option=application.option;             //设置启动参数
        this.option.show=false;
        this.icon = application.icon;        //设置icon
        this.trayOption = application.tray;         //设置托盘配置
        if(this.trayOption){
            this.trayOption.icon = application.icon;
        }
        this.method = application.method;
    }

    //获取页面对象
    getWebContents(event){
        event.returnValue=this.win.webContents;
    }

    setMessage(){
        this.message = new message(this.win);
    }

    /**
     * 发送消息
     * @param {*} emit 
     * @param {*} data 
     */
    send(emit,data){
        if(this.win && this.win.webContents){
            this.win.webContents.send(emit,data);
        }else{
            console.error("窗体不存在");
        }
        
    }
    /**
     * 获取船体媒体源id
     * @returns 
     */
    getMediaSourceId(){
        return this.win.getMediaSourceId();
    }


    loadFile(file){
        return this.win.loadFile(file);
    }

    open(){
        return new Promise((reslove,reject)=>{
            //创建窗口
            this.win = new electron.BrowserWindow(this.option);
            this.win.windowId = "main";
            this.win.on('ready-to-show',()=>{
                this.win.show();
            });
            this.win.setIcon(this.icon);
            this.message = new message(this.win);
            reslove(this.win);
        });
    }

    /**
     * 关闭窗口
     */
    close(){
        if(this.page){
            this.page.unload();
            this.page=null;
        }
        this.win.destroy();
    }

    setContentSize(width,height,animate){
        return this.win.setContentSize(width,height,animate);
    }
    removeMenu(){
        return this.win.removeMenu();
    }
    relaunch(){
        electron.app.relaunch();
        electron.app.exit();
    }
    selectPath(){
        return new Promise(function(resolve,reject){
            electron.dialog.showOpenDialog({properties:["openDirectory"]}).then(function(result){
                if(result.canceled){
                    reject("取消选择")
                }else{
                    resolve(result.filePaths[0]);
                }
            }).catch(function(err){
                reject(err)
            })
        })
    }
    selectExe(){
        return new Promise(function(resolve,reject){
            electron.dialog.showOpenDialog({properties:["openFile"],filters:[{name:"可执行程序",extensions:["exe"]}]}).then(function(result){
                if(result.canceled){
                    reject("取消选择")
                }else{
                    resolve(result.filePaths[0]);
                }
            }).catch(function(err){
                reject(err)
            })
        })
    }
    
    setAutoRun(){
        electron.app.setLoginItemSettings({
            openAtLogin: true,
            path:process.execPath,
            args:["--hidden"]
        });
    }
    setUnAutoRun(){
        electron.app.setLoginItemSettings({
            openAtLogin: false,
            path:process.execPath,
            args:[]
        });
    }
    getAutoRun(){
        return electron.app.getLoginItemSettings().executableWillLaunchAtLogin
    }
    
    /**
     * 最小化到托盘
     * @returns 
     */
    tray(){
        if(!this.trayOption){
            return ;
        }
        this.hide();
        let tray = new electron.Tray(this.trayOption.icon);
        let menu = [];
        let _this = this;
        for(let i in this.trayOption.menu){
            menu.push({
                label:this.trayOption.menu[i].label,
                click:function(){
                    _this.trayOption.menu[i].click(_this);
                }
            })
        }
        if(menu.length>0){
            tray.setContextMenu(electron.Menu.buildFromTemplate(menu));
        }
        if(this.trayOption.toolTip){
            tray.setToolTip(this.trayOption.toolTip);
        }
        tray.on("click",function(){
            _this.isVisible() ? _this.hide() : _this.show();
            tray.destroy();
        });
    }

    
    loadPage(route,data){
        if(this.page){
            this.page.unload();
            this.page=null;
        }
        let curPage = new page(this,route,data);
        curPage.beforeLoad().then(()=>{
            curPage.setGlobalMethod(this.method);
            curPage.config();
            curPage.run();
            this.page = curPage;
        }).catch(function(e){
            console.log(e);
        });
    }

    
    /**
     * 判断窗口是否显示状态
     * @returns 
     */
    isVisible(){
        return this.win.isVisible();
    }
    /**隐藏窗体 */
    hide(){
        this.win.hide();
    }
    /**显示窗体 */
    show(){
        this.win.show();
    }
}


module.exports=window