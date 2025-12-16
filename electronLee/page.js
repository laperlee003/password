
const request = require('./request');
let path = require("path");


class page {
    constructor(window,router,data){
        this.window = window;
        this.router = router;
        this.data = data;
        this.methodFunctions = {};
        this.globalMethodFunctions = {};
        this.init();
    }
    init(){
        let routers = this.router.split(".");

        let keyConfigParams = [__dirname,"..",this.window.name,"page"].concat(routers).concat("index.json");
        this.option = require(path.join(...keyConfigParams));

        let fileParams = [__dirname,"..",this.window.name,"page"].concat(routers).concat("index.html");
        this.file = path.join(...fileParams);

        let logicParams = [__dirname,"..",this.window.name,"page"].concat(routers).concat("logic.js");
        this.logic = require(path.join(...logicParams));

        let _this = this;
        if(this.logic.method){
            for(let method in this.logic.method){
                this.methodFunctions[method] = function (event,arg){
                    let req = new request(event,arg);
                    _this.logic.method[method](_this.window,req);
                }
            }
        }
    }

    setGlobalMethod(methods){
        let _this = this;
        if(methods){
            for(let method in methods){
                this.globalMethodFunctions[method] = function(event,arg){
                    let req = new request(event,arg);
                    methods[method](_this.window,req);
                }
            }
        }
    }

    unload(){
        this.removeListener();
        if(this.logic && this.logic.unload){
            this.logic.unload();
        }
    }
    removeListener(){
        let _this = this;
        if(this.globalMethodFunctions){
            for(let method in this.globalMethodFunctions){
                electron.ipcMain.removeListener(method,this.globalMethodFunctions[method]);
            }
        }
        if(this.methodFunctions){
            for(let method in this.methodFunctions){
                electron.ipcMain.removeListener(method,this.methodFunctions[method]);
            }
        }
    }


    beforeLoad(){
        return new Promise((resolve,reject)=>{
            if(this.logic && this.logic.beforeLoad){
                let ret=this.logic.beforeLoad(this.window);
                if(!ret){
                    reject();
                    return ;
                }
            }
            resolve();
        })
    }
    run(){
        let _this = this;
        this.window.loadFile(this.file).then(function(){
            if(_this.globalMethodFunctions){
                for(let method in _this.globalMethodFunctions){
                    electron.ipcMain.on(method,_this.globalMethodFunctions[method]);
                }
            }
            if(_this.methodFunctions){
                for(let method in _this.methodFunctions){
                    electron.ipcMain.on(method,_this.methodFunctions[method]);
                }
            }
            _this.logic.load(_this.window,_this.data);
        });
    }

    config(){
        if(this.option.winSize){
            this.window.setContentSize(this.option.winSize.width,this.option.winSize.height,true);
        }
        if(this.option.menu){
            //FIXME 菜单设置
        }else{
            this.window.removeMenu();
        }
    }
}

module.exports=page;