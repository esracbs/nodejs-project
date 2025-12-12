const express = require('express');
const router = express.Router();

const Roles=require("../db/models/Roles");
const RolePrivileges=require("../db/models/RolePrivileges");
const Response=require("../lib/Response");
const CustomError=require("../lib/Error");
const Enum=require("../config/Enum");
const role_privileges=require("../config/role_privileges");
const UserRoles = require('../db/models/UserRoles');
const config = require("../config");
const i18n = new (require("../lib/i18n"))(config.DEFAULT_LANG);

const auth=require("../lib/auth")();

router.all("*",auth.authenticate(),(req,res,next)=>{//*dedim yani auditlogs ile başlayan tüm endpointlerde çalışmasını istiyorum.
  next();
});
router.get('/', auth.checkRoles("role_view"),async(req, res) =>{
  try {
    let roles=await Roles.find({});
    res.json(Response.successResponse(roles));
  } 
  catch (err) {
    let errorResponse=Response.errorResponse(err);
    res.status(errorResponse.code).json(Response.errorResponse(err))
  }
});

router.post("/add",auth.checkRoles("role_add"),async(req,res)=>{
    let body=req.body;
    try {
        if(!body.role_name){
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user.language),i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user.language, ["role_name"]));
        }
        if(!body.permissions||!Array.isArray(body.permissions)||body.permissions.length===0){
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user.language),i18n.translate("COMMON.FIELD_MUST_BE_TYPE", req.user.language, ["permissions", "Array"]));
        }
        let role= new Roles({
            role_name:body.role_name,
            is_active:true,
            created_by:req.user?.id//req user varsa idyi al eğer yoksa hata verme nullable işte
        });
        await role.save();
        for (let i = 0; i < body.permissions.length; i++) {
            let priv=new RolePrivileges({
                role_id:role._id,
                permission:body.permissions[i],
                created_by:req.user?.id
            });
            await priv.save();
        }
        res.json(Response.successResponse({success:true}));
    } catch (err) {
        let errorResponse=Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});
router.post("/update",auth.checkRoles("role_update"),async(req,res)=>{
    let body=req.body;
    try {
        if(!body._id){
           throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user.language),i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user.language, ["_id"]));
        }
        let updates={};
        if(body.role_name) updates.role_name=body.role_name;
        if(typeof body.is_active==="boolean") updates.is_active=body.is_active;
        
        if(body.permissions&&Array.isArray(body.permissions)&&body.permissions.length>0){

            let permissions=await RolePrivileges.find({role_id:body._id});
            let removedPermissions=permissions.filter(p=>!body.permissions.includes(p.permission));
            //body.permissions bir string dizisi ["category_view","user_view"] gibi
            //permissions dizisi ise [{_id:"bcd",role_id:"abc",permission:"category_view"},{role_id:1,permission:"user_view"}] gibi
            //permission key alanına denkti zaten bu alan yeni gönderilen requestte var mı yok mu kontrol ediyorum
            let newPermissions=body.permissions.filter(p=>!permissions.map(p=>p.permission).includes(p));
            //id değeri removed permissions listesindeki idlerden biriyse bunu dbden sil
            if(removedPermissions.length>0){
                await RolePrivileges.deleteMany({_id:{$in:removedPermissions.map(p=>p._id)}});
            }
            if(newPermissions.length>0){
                for (let i = 0; i < newPermissions.length; i++) {
                    let userRole=new RolePrivileges({
                        role_id:body._id,
                        permission:newPermissions[i],
                        created_by:req.user?.id
                    });
                    await userRole.save();
                }
            }
        }
        
        
        await Roles.updateOne({_id:body._id},updates);
        res.json(Response.successResponse({success:true}));
    } catch (err) {
        let errorResponse=Response.errorResponse(err);
        console.log(err)
        res.status(errorResponse.code).json(errorResponse);
        
    }
});

router.post("/delete", auth.checkRoles("role_delete"),async (req, res) => {
    let body = req.body;
//rolü silerken privilegesini de silmemiz gerekiyor bunu model/roles.js de yaptık
    try {
        if (!body._id)throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user.language),i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user.language, ["_id"]));
        await Roles.deleteOne({ _id: body._id });
        await UserRoles.deleteMany({ user_id: body._id });
        res.json(Response.successResponse({ success: true }));

    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }

});
router.get("/role_privileges",async(req,res)=>{
    res.json(role_privileges);
})
module.exports = router;
