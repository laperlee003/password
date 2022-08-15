let fs = require("fs");
const path = require("path");
let dbDir = path.join(__home__,"data");
if(!fs.existsSync(dbDir)){
    fs.mkdirSync(dbDir);
}
function scanPwd(){
    return new Promise((resolve,rejects)=>{
        let pwd = [];
        fs.promises.readdir(dbDir).then(async files=>{
            for(let file of files){
                let _file = path.join(dbDir,file);
                if(!fs.statSync(_file).isDirectory() && checkExt(_file,"pwd")){
                    pwd.push(_file);
                }
            }
            resolve(pwd);
        });
    });
}

function checkExt(file,ext){
    let files=file.split(".");
    if(files.length<=1){
        return false;
    }
    let _ext = files[files.length-1];
    return _ext.toUpperCase() == ext.toUpperCase();
}

function readPwd(file){
    let Buffer = fs.readFileSync(file);
    if(!Buffer){
        return null;
    }
    return Buffer.toString();
}


function savePwd(name,pwd){
    let file = path.join(dbDir,name+".pwd");
    fs.writeFileSync(file,pwd);
}
function deletePwd(name){
    let file = path.join(dbDir,name+".pwd");
    fs.unlinkSync(file);
}
function getPwdFileName(file){
    file=file.replace(dbDir+path.sep,"");
    let files=file.split(".");
    return files[0];
}
function getSecret(){
    file = path.join(dbDir,"secret");
    if(!fs.existsSync(file)){
        return null;
    }
    let Buffer = fs.readFileSync(file);
    if(!Buffer){
        return null;
    }
    return Buffer.toString();
}
function saveSecret(secret){
    file = path.join(dbDir,"secret");
    fs.writeFileSync(file,secret);
}
function deleteSecret(){
    file = path.join(dbDir,"secret");
    if(!fs.existsSync(file)){
        return null;
    }
    fs.unlinkSync(file);
}

module.exports={
    saveSecret,
    deleteSecret,
    getSecret,
    scanPwd,
    checkExt,
    readPwd,
    savePwd,
    deletePwd,
    getPwdFileName
}