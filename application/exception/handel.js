class ExceptionHandel{
    on(window,exception){
        if(typeof exception == "object"){
            switch(exception.code){
                case "AlertException":
                    if(window.message){
                        window.message.alert(exception.title || "错误",exception.message || "未知错误");
                    } else {
                        console.error("异常:", exception.title, exception.message);
                    }
                    break;
                default:
                    console.error("未处理异常:", exception);
                    break;
            }
        }else{
            console.error("未处理异常:", exception);
        }
    }
}

module.exports = ExceptionHandel;
