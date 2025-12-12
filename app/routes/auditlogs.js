var express = require('express');
const Response=require("../lib/Response");
const moment=require("moment");//moment modülü tarih işlemlerini kolaylaştırmamızı sağlayan bir modül 
const CustomError=require("../lib/Error");
const AuditLogs=require("../db/models/AuditLogs")
var router = express.Router();
const auth=require("../lib/auth")();

router.all("*",auth.authenticate(),(req,res,next)=>{//*dedim yani auditlogs ile başlayan tüm endpointlerde çalışmasını istiyorum.
  next();
});

router.post('/', auth.checkRoles("auditlogs_view"),async(req, res, next) =>{//auditlogs_view yetkisine sahip olan kullanıcılar sadece bu metoda istek atabilecek
  try {
    let body=req.body;
    let query={};
    let skip=body.skip;
    let limit=body.limit;
    if(typeof body.skip !=="number"){
      skip=0;
    }
    if(typeof body.limit !=="number"||body.limit>500){
      limit=500;
    }
    if(body.begin_date && body.end_date){
      query.created_at= {
        $gte:moment(body.begin_date),//string olarak gelen değerleri moment ile tarih formatına çevirdik.
        $lte:moment(body.end_date)
      }//gte:greater than equal to begindateden büyük ,lte:less than equal to(enddateden küçük)
      res.json(Response.successResponse(auditlogs));
    }
    else{//moment bugünün tarihini çeker start of bugünün 00000 dan başlamasını sağlar
      query.created_at={
        $gte:moment().subtract(1,"day").startOf("day"),
        $lte:moment()
      }
    }
    let auditlogs=await AuditLogs.find(query).sort({created_at:-1}).skip(skip).limit(limit);//queryden 500den fazla veri gelirse fazlasını alma dedik pagination da atlaya atlaya verileri getirir
    //created at alanına göre tersten sırala
    res.json(Response.successResponse(auditlogs));
  } catch (err) {
    
        let errorResponse = Response.errorResponse(err,req.user?.language);
        res.status(errorResponse.code).json(errorResponse);
  }
});

module.exports = router;