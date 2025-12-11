const mongoose= require("mongoose");
const RolePrivileges = require("./RolePrivileges");
const schema= mongoose.Schema({
    role_name:{type:String,required:true,unique:true},
    is_active:{type:Boolean,default:true},
    created_by:{
        type:mongoose.SchemaTypes.ObjectId,
        //required:true
    }
},{
    versionKey:false,//otomatik oluşan bir parametre bu ve biz bunun otomatik oluşmasını engelliyoruz
    timestamps:{
        createdAt:"created_at",
        updatedAt:"updated_at"
    }
});
class Roles extends mongoose.Model{//bir işlem yaparken öncesinde kontrol yapmamızı sağlayan kısım. add isteği işlenmeden önce buradan geçecek mesela gibi gibi
    //remove çağırıldığında buna giriyor
    //override ediyoruz remove metodunu
    //super=>mongoose.Model classını temsil ediyor
    static async deleteOne(query){
        if(query._id){
            await RolePrivileges.deleteMany({role_id:query._id});//eğer bir rol silinirse buna ait olan rolprivileges kısımını da sil
        }
        return super.deleteOne(query);
    }
}
schema.loadClass(Roles);
module.exports=mongoose.model("roles",schema);