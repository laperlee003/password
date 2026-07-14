let page = require("./page");

function toDialogText(value){
    if(value === undefined || value === null){
        return "";
    }
    if(typeof value === "string"){
        return value;
    }
    if(value instanceof Error){
        return value.message || value.stack || String(value);
    }
    if(typeof value === "object"){
        if(typeof value.message === "string"){
            return value.message;
        }
        try {
            return JSON.stringify(value);
        } catch (e) {
            return String(value);
        }
    }
    return String(value);
}

class message{
    constructor(win){
        this.win = win;
        return this;
    }
    alert(title,message){
        return electron.dialog.showMessageBox(this.win,{
            title:toDialogText(title) || "提示",
            message:toDialogText(message) || "未知错误"
        });
    }
    confirm(message,buttons){
        let _buttons=[];
        let callback=[];
        let defaultId=0;
        for(let i in buttons){
            _buttons.push(toDialogText(buttons[i].name));
            callback.push(buttons[i].callback);
            if(buttons[i].default){
                defaultId=i;
            }
        }
        electron.dialog.showMessageBox(this.win,{
            type:"question",
            title:"确认框",
            defaultId:defaultId,
            message:toDialogText(message) || "请确认操作",
            buttons:_buttons
        }).then(function(index){
            if(callback[index.response]){
                callback[index.response]();
            }
        })
    }
}

module.exports=message;
