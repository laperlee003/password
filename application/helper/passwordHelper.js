class StringEncodeDecode{
    constructor(key){
        this.key=key;
    }

    encode(string){
        let strLen = string.length;
        let strArr = [];
        for(let i=0;i<strLen;i++){
            strArr.push(string.substr(i,1));
        }
        let strArr1 = [];
        let strArr2 = [];
        for(let index in strArr){
            if(index%2){
                strArr1.push(strArr[index]);
            }else{
                strArr2.push(strArr[index]);
            }
        }
        let str1 = strArr1.join("");
        let str2 = strArr2.join("");
        return this.base64(this.base64(str1)+this.key.toLocaleUpperCase()+this.base64(str2));
    }

    decode(string){
        string = this.unbase64(string);
        let skey = this.key.toLocaleUpperCase();
        let arr = string.split(skey);
        if(arr.length!=2){
            return null;
        }
        let str1 = this.unbase64(arr[0]);
        let str2 = this.unbase64(arr[1]);
        let strArr = [];
        for(let i=0;i<str1.length;i++){
            strArr[i*2+1] = str1.substr(i,1);
        }
        for(let i=0;i<str2.length;i++){
            strArr[i*2] = str2.substr(i,1);
        }
        return strArr.join("");
    }

    base64(string){
        return Buffer.from(string,"utf-8").toString("base64");
    }
    unbase64(string){
        return Buffer.from(string,"base64").toString("utf-8");
    }
}

let fileHelper = require("./fileHelper");
let os = require("os");
let path = require("path");

let pwds = new Map;
function readPwd(){
    let userSecret = getUserSecret();
    return new Promise((resolve,reject)=>{
        if(!userSecret){
            reject("密钥获取失败");
            return;
        }
        let tools = new StringEncodeDecode(userSecret);
        fileHelper.scanPwd().then(files=>{
            let nextPwds = new Map;
            let skippedFiles = [];
            let invalidFiles = [];

            for(let file of files){
                try {
                    let name = fileHelper.getPwdFileName(file);
                    name = tools.decode(name);
                    if(!name){
                        skippedFiles.push(file);
                        continue;
                    }
                    let context = fileHelper.readPwd(file);
                    context = tools.decode(context);
                    if(!context){
                        skippedFiles.push(file);
                        continue;
                    }
                    try {
                        context=JSON.parse(context);
                    } catch (error) {
                        invalidFiles.push({
                            file,
                            error
                        });
                        continue;
                    }
                    if(!context || typeof context !== "object"){
                        invalidFiles.push({
                            file,
                            error:"密码记录格式错误"
                        });
                        continue;
                    }
                    console.log("[password parsed]", {
                        name,
                        account: maskValue(context.account),
                        pwdLength: context.pwd ? String(context.pwd).length : 0,
                        notes: context.notes || ""
                    });
                    nextPwds.set(name,context);
                } catch (error) {
                    invalidFiles.push({
                        file,
                        error
                    });
                }
            }

            if(files.length > 0 && nextPwds.size === 0 && (skippedFiles.length > 0 || invalidFiles.length > 0)){
                reject("主密钥不正确或密码数据损坏，请确认密钥后重试");
                return;
            }

            if(invalidFiles.length > 0){
                console.warn(`跳过 ${invalidFiles.length} 条无法解析的密码记录`);
                invalidFiles.forEach(item=>{
                    let msg = item.error && item.error.message ? item.error.message : item.error;
                    console.warn(path.basename(item.file), msg);
                });
            }

            pwds = nextPwds;
            resolve(pwds);
        }).catch(e=>{
            reject(e);
        });
    })
}

function getByName(name){
    return pwds.get(name);
}

function maskValue(value){
    if(!value){
        return "";
    }
    value = String(value);
    if(value.length <= 2){
        return "***";
    }
    return value.slice(0,1)+"***"+value.slice(-1);
}

function savePwd(name,account,pwd,notes){
    let tools = new StringEncodeDecode(getUserSecret());
    let context = {account,pwd,notes: notes || ""}
    pwds.set(name,context);
    fileHelper.savePwd(tools.encode(name),tools.encode(JSON.stringify(context)));
}

function deletePwd(name){
    let tools = new StringEncodeDecode(getUserSecret());
    pwds.delete(name);
    fileHelper.deletePwd(tools.encode(name));
}

let _userSecret;
function setSecret(secret,save){
    if(save){
        let tools = new StringEncodeDecode(os.hostname());
        fileHelper.saveSecret(tools.encode(secret));
    }else{
        fileHelper.deleteSecret();
    }
    _userSecret=secret;
}
function getUserSecret(){
    if(_userSecret){
        return _userSecret;
    }
    let secret = fileHelper.getSecret();
    let tools = new StringEncodeDecode(os.hostname());
    return tools.decode(secret);
}

function flush(){
    _userSecret=null;
    pwds = new Map;
}


module.exports={
    getUserSecret,
    setSecret,
    readPwd,
    getByName,
    savePwd,
    deletePwd,
    flush,
}
