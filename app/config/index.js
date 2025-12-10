module.exports={//bu dosyanın export edilebilir oldupunu belirtiyor
    "PORT":process.env.PORT||"3000",
    "LOG_LEVEL":process.env.LOG_LEVEL || "debug",
    "CONNECTION_STRING":process.env.CONNECTION_STRING||"mongodb://localhost:27017/localdb"
}