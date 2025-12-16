let AlertException = require("./../../exception/AlertException");
let passwordHelper = require("./../../helper/passwordHelper");
const { clipboard } = require('electron');

module.exports = {
    load:(window,data)=>{
        // 窗口加载时的初始化逻辑
    },
    unload:()=>{
        // 窗口卸载时的清理逻辑
    },
    method:{
        submit:(window,request)=>{
            if(!request.data.name){
                request.fail("请填写名称");
                return ;
            }
            if(!request.data.account){
                request.fail("请填写账号");
                return ;
            }
            if(!request.data.pwd){
                request.fail("请填写密码");
                return ;
            }

            // 检查名称是否已存在
            let exsit = passwordHelper.getByName(request.data.name);
            if(exsit){
                request.fail("名称已存在");
                return ;
            }

            // 保存密码（包含备注信息）
            passwordHelper.savePwd(request.data.name, request.data.account, request.data.pwd, request.data.notes);

            // 保存成功后通知主窗口刷新
            setTimeout(() => {
                try {
                    if(window.parent && typeof window.parent.send === 'function'){
                        window.parent.send("refresh-list");
                    }
                } catch(e) {
                    console.log("通知主窗口刷新失败:", e.message);
                }
            }, 100);

            request.success();
        },
        copy:(window,request)=>{
            clipboard.writeText(request.data, 'tmp');
            request.success();
        }
    }
}
