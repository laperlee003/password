let electron = require("electron");
function initProgram(){
    return {
        send:(emit,data)=>{
            return new Promise((resolve,reject)=>{
                let ret = electron.ipcRenderer.sendSync(emit,data);
                if(ret.success){
                    resolve(ret.data);
                }else{
                    reject(ret.msg);
                }
            })
        },
        listen:(emit,fun)=>{
            electron.ipcRenderer.on(emit,(event,data)=>{
                fun(data);
            });
        },
        message:(emit,data)=>{
            electron.ipcRenderer.send(emit,data);
        }
    }
    
}

function close(){
    program.message("close");
}

function closeDialog(){
    program.message("closeDialog");
}