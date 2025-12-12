
var express = require('express');
var router = express.Router();
const Categories=require("../db/models/Categories")//bu şekilde import edildiğinde modelste kullandığımız mongoosun bize sunduğu fonksiyonları kullanabilir hale geliyorum.
const Response=require("../lib/Response");
const CustomError=require("../lib/Error");
const AuditLogs = require("../lib/AuditLogs");
const Enum=require("../config/Enum");
const logger=require("../lib/logger/LoggerClass");

const auth=require("../lib/auth")();

router.all("*",auth.authenticate(),(req,res,next)=>{//*dedim yani auditlogs ile başlayan tüm endpointlerde çalışmasını istiyorum.
  next();
});
router.get('/', async(req, res, next) =>{
  try {
    let categories=await Categories.find({});
    res.json(Response.successResponse(categories));
  } 
  catch (err) {
    let errorResponse=Response.errorResponse(err);
    res.status(errorResponse.code).json(Response.errorResponse(err))
  }
});
router.post("/add",async(req,res)=>{
    let body=req.body;
    try {
        if(!body.name){
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST,"Validation Error!","İsim alanı doldurulmalıdır!");
        }
        let category= new Categories({
            name:body.name,
            is_active:true,
            created_by:req.user?.id
        });
        await category.save();
        AuditLogs.info(req.user?.email,"Categories","Add",category);
        logger.info(req.user?.email,"Categories","Add",category);
        res.json(Response.successResponse({success:true}));
    } catch (err) {
        logger.error(req.user?.email,"Categories","Add",err);
        let errorResponse=Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});
router.post("/update",async(req,res)=>{
    let body=req.body;
    try {
        if(!body._id){
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST,"Validation Error!","Id alanı doldurulmalıdır!");
        }
        let updates={};
        if(body.name) updates.name=body.name;
        if(typeof body.is_active==="boolean") updates.is_active=body.is_active;
        await Categories.updateOne({_id:body._id},updates);
        AuditLogs.info(req.user?.email,"Categories","Update","Updated");
        res.json(Response.successResponse({success:true}));
    } catch (err) {
        let errorResponse=Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
        
    }
});

router.post("/delete", async (req, res) => {
    let body = req.body;

    try {
        if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Id alanı doldurulmalıdır!");// i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user.language), i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user.language, ["_id"]));
        await Categories.deleteOne({ _id: body._id });

        AuditLogs.info(req.user?.email,"Categories","Delete",{_id:body.id});
        res.json(Response.successResponse({ success: true }));

    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }

});
module.exports = router;