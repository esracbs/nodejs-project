const passport=require("passport");
const {ExtractJwt,Strategy}=require("passport-jwt");
const config=require("../config");
const Users=require("../db/models/Users");
const UserRoles=require("../db/models/UserRoles");
const RolePrivileges = require("../db/models/RolePrivileges");
const privs=require("../config/role_privileges");
const Response=require("./Response");
const {HTTP_CODES}=require("../config/Enum");
const CustomError = require("./Error");

module.exports=function(){
    let strategy=new Strategy({
        secretOrKey:config.JWT.SECRET,
        jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken()
    },async (payload,done)=>{
        try {
        let user=await Users.findOne({_id:payload.id});
        if(user){
            let userRoles=await UserRoles.find({user_id:payload.id});
            let rolePrivileges= await RolePrivileges.find({role_id:{$in:userRoles.map(ur=>ur.role_id)}});
            let privileges=rolePrivileges.map(rp=>privs.privileges.find(x=>x.key==rp.permission));//rolePrivileges'de olan privilages'i privileges dizisine ekle
            done(null,{
                id:user._id,
                roles:privileges,
                email:user.email,
                first_name:user.first_name,
                last_name:user.last_name,
                language:user.language,
                exp:parseInt(Date.now()/1000)*config.JWT.EXPIRE_TIME//date.now milisaniye cinsinden şuanki tarihi verir 1000e bölerek saniyeye cevirdik configteki expire timeyle çarptık
            })
        }else{
            done(new Error("User not found"),false);
        }
        } catch (error) {
            done(error,null);
        }
    });

    passport.use(strategy);
    return{
        initialize:()=>passport.initialize(),
        authenticate:()=>passport.authenticate("jwt",{session:false}),//istek içinde authorization headeriyle beraber gönderilen jwt tokeni kontrol ediyo ve eğer düzgün bir jwt token verilmişse çağrılan yerlerde next çalıştırılıyor
        //eğer jwt token hatalı veya gönderilmedi ise de unauthorized hatası veriyor
        checkRoles:(...expectedRoles)=>{//req.user yukarıda done ile gönderilen verileri kapsayan bir dizi
            return (req,res,next)=>{
                let i=0;
                let privileges=req.user.roles.map(x=>x.key);
                while(i<expectedRoles.length && !privileges.includes(expectedRoles[i])){
                    i++;
                }
                if(i>=expectedRoles.length){
                    let response=Response.errorResponse(new CustomError(HTTP_CODES.UNAUTHORIZED,"Authorization Error!","Yetkisi yok!"));
                    return res.status(response.code).json(response);
                }
                return next();//Authorize işlemi başarılı
            }
            
        }
    }
}