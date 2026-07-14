class AlertException{
    constructor(message){
        this.code = "AlertException";
        this.title = "错误";
        this.message = formatMessage(message);
        return this;
    }
}

function formatMessage(message){
    if(message === undefined || message === null){
        return "未知错误";
    }
    if(typeof message === "string"){
        return message;
    }
    if(message instanceof Error){
        return message.message || message.stack || String(message);
    }
    if(typeof message === "object"){
        if(typeof message.message === "string"){
            return message.message;
        }
        try {
            return JSON.stringify(message);
        } catch (e) {
            return String(message);
        }
    }
    return String(message);
}

module.exports = AlertException;
