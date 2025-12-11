const mongoose= require("mongoose");
const schema= mongoose.Schema({
    level:String,
    email:String,
    proc_type:String,
    log:mongoose.SchemaTypes.Mixed//herhangi bir tip alabilir.
},{
    versionKey:false,//otomatik oluşan bir parametre bu ve biz bunun otomatik oluşmasını engelliyoruz
    timestamps:{
        createdAt:"created_at",
        updatedAt:"updated_at"
    }
});
class AuditLogs extends mongoose.Model{

}
schema.loadClass(AuditLogs);
module.exports=mongoose.model("audit_logs",schema);