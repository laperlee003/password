let program;
let save = ()=>{
    if(document.getElementById("submit").classList.contains("disable")){
        return ;
    }
    let name=document.getElementById("name").value;
    let account=document.getElementById("account").value;
    let pwd=document.getElementById("pwd").value;
    return new Promise((resolve,reject)=>{
        program.send("submit",{
            name,
            account,
            pwd,
        }).then(()=>{
            document.getElementById("name").value="";
            document.getElementById("account").value="";
            document.getElementById("pwd").value="";
            document.getElementById("submit").classList.remove("disable");
            resolve({
                name,
                account,
                pwd,
            });
        }).catch(msg=>{
            reject(msg);
        });
    })
};

let del = (name)=>{
    return new Promise((resolve,reject)=>{
        program.send("del",name).then(()=>{
            resolve();
        }).catch(msg=>{
            reject(msg);
        });
    })
}

let hideString=(string)=>{
    if(!string.length){
        return "无";
    }else if(string.length<3){
        return "***";
    }else if(string.length<=5){
        return string.slice(0,1)+"***";
    }else{
        return string.slice(0,1)+"***"+string.slice(-1);
    }
}


let insetItem = (name,account,pwd)=>{

    let itemElement = document.createElement("div");
    itemElement.classList.add("item");
    let nameElement = document.createElement("div");
    let accountElement = document.createElement("div");
    let pwdElement = document.createElement("div");
    let acctionElement = document.createElement("div");
    nameElement.innerHTML=name;
    accountElement.innerHTML=hideString(account);
    pwdElement.innerHTML="***";
    acctionElement.classList.add("action");
    let copyPwdElement = document.createElement("a");
    copyPwdElement.classList.add("btn");
    copyPwdElement.innerHTML="复制密码";
    copyPwdElement.addEventListener("click",()=>{
        program.send("copy",pwd).then(()=>{
            alert("密码复制成功");
        });
    });
    if(account.length){
        let copyAccountElement = document.createElement("a");
        copyAccountElement.classList.add("btn");
        copyAccountElement.innerHTML="复制账号";
        copyAccountElement.addEventListener("click",()=>{
            program.send("copy",account).then(()=>{
                alert("账号复制成功");
            });
        });
        acctionElement.append(copyAccountElement);
    }
    let deleteElement = document.createElement("a");
    deleteElement.classList.add("btn");
    deleteElement.innerHTML="删除";
    deleteElement.addEventListener("click",()=>{
        let ret = window.confirm("是否确认删除");
        if(ret){
            del(name).then(()=>{
                alert("删除成功");
                itemElement.remove();
            });
        }
    });

    acctionElement.append(copyPwdElement);
    acctionElement.append(deleteElement);
    itemElement.append(nameElement);
    itemElement.append(accountElement);
    itemElement.append(pwdElement);
    itemElement.append(acctionElement);

    document.getElementById("list").appendChild(itemElement);
}
window.onload = ()=>{
    program = initProgram();
    document.getElementById("close").addEventListener("click",()=>{
        program.message("close")
    });
    document.getElementById("init").addEventListener("click",()=>{
        program.message("init")
    });
    

    program.listen("pwds",(pwds)=>{
        pwds.forEach((item,name)=>{
            insetItem(name,item.account,item.pwd);
        });
    })


    document.getElementById("submit").addEventListener("click",()=>{
        save().then(res=>{
            alert("密码记录成功");
            insetItem(res.name,res.account,res.pwd);
        }).catch(e=>{
            alert(msg);
        });
    });


}
