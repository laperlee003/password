class ExceptionHandel{
    on(window,exception){
        if(typeof exception == "object"){
            switch(exception.code){
                case "AlertException":
                    if(window.message){
                        window.message.alert(exception.title,exception.message);
                    } else {
                        console.error("异常:", exception.title, exception.message);
                    }
                    break;
            }
        }
    }
}

module.exports = ExceptionHandel;