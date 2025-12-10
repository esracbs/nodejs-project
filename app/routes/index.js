var express = require('express');
var router = express.Router();
//fs kütüphanesi ile dosya işlemleri yapılıyor
const fs=require("fs");
let routes=fs.readdirSync(__dirname)//bu işlem bitmeden alt satıra geçmeyecek bir klasör okuma işlemi başlatıyoruz
for (let route of routes) {//istek atıldığında hangi routeye istek atılıyorsa onu bulur ve istek oraya otomatik düşer elle routeleri tek tek belirtmemize gerek kalmaz
  if (route.includes(".js")&& route!="index.js") {
    router.use("/"+route.replace(".js",""),require('./'+route))
  }
  
}
module.exports = router;
