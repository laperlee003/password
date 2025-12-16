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

let pwds = new Map;
function readPwd(){
    let userSecret = getUserSecret();
    return new Promise((resolve,reject)=>{
        if(!userSecret){
            reject("密钥获取失败");
        }
        let tools = new StringEncodeDecode(userSecret);
        fileHelper.scanPwd().then(files=>{
            for(let file of files){
                let name = fileHelper.getPwdFileName(file);
                name = tools.decode(name);
                if(!name){
                    continue;
                }
                let context = fileHelper.readPwd(file);
                context = tools.decode(context);
                if(!context){
                    continue;
                }
                context=JSON.parse(context);
                pwds.set(name,context);
            }
            resolve(pwds);
        }).catch(e=>{
            reject(e);
        });
    })
}

function getByName(name){
    return pwds.get(name);
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