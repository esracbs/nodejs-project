module.exports={//bu dosyanın export edilebilir oldupunu belirtiyor
    "PORT":process.env.PORT || "3000",
    "LOG_LEVEL":process.env.LOG_LEVEL || "debug",
    "CONNECTION_STRING":process.env.CONNECTION_STRING||"mongodb://localhost:27017/localdb",
    "JWT":{
        "SECRET":"123",
        "EXPIRE_TIME":!isNaN(parseInt(process.env.EXPIRE_TIME))?parseInt(process.env.EXPIRE_TIME):24*60*60//86400
        //process env ile aldığımız her şey stringtir. bu nedenle bunu sayıya çevirdik.isnan ile çevirdiğimiz şey gerçekten sayıya dönüştü mü eğer sayı ise kullanıcaz değilse biz saniye cinsine denk gelecek şekilde 1 gün verdik.
    }
}