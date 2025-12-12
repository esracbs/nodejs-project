const Enum = require("../config/Enum");
const config = require("../config");
const CustomError=require("./Error")
const i18n = new (require("../lib/i18n"))(config.DEFAULT_LANG);
class Response{
    constructor(){}
    //static:biz bir class tanımladık ve bunu export ettik c# newlememiz gereken sınıflara static diyerek direkt sınıf adı ile ulaşabiliriz. response.successresponse
    static successResponse(data,code=200){
        return{
            code,
            data
        }
    }
    static errorResponse(error,lang){
        if(error instanceof CustomError){
            return{
                code:error.code,
                error:{
                    message:error.message,
                    description:error.description
                }
            }

        }
        else if(error.message.includes("E11000")){
            return{
                code: Enum.HTTP_CODES.CONFLICT,
                error:{
                    message:i18n.translate("COMMON.ALREADY_EXISTS", lang),
                    description:("COMMON.ALREADY_EXISTS", lang)
                }
            }
        }
        return{
            code: Enum.HTTP_CODES.INT_SERVER_ERROR,
            error:{
                message:("COMMON.UNKNOWN_ERROR", lang),
                description:error.message
            }
        }
    }
}
module.exports=Response;