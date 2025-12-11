const Enum = require("../config/Enum");
const CustomError=require("./Error")
class Response{
    constructor(){}
    //static:biz bir class tanımladık ve bunu export ettik c# newlememiz gereken sınıflara static diyerek direkt sınıf adı ile ulaşabiliriz. response.successresponse
    static successResponse(data,code=200){
        return{
            code,
            data
        }
    }
    static errorResponse(error){
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
                    message:"Zaten mevcut değer eklemesi",
                    description:"Zaten mevcut değer eklemesi"
                }
            }
        }
        return{
            code: Enum.HTTP_CODES.INT_SERVER_ERROR,
            error:{
                message:"Hata",
                description:error.message
            }
        }
    }
}
module.exports=Response;