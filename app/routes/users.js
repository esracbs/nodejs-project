var express = require('express');
const bcrypt = require("bcrypt-nodejs");
const Users = require("../db/models/Users");
const Response = require("../lib/Response");
const CustomError = require("../lib/Error");
const Enum = require("../config/Enum");
const UserRoles = require("../db/models/UserRoles");
const Roles = require("../db/models/Roles");
var router = express.Router();
const is = require("is_js");
//const jwt = require("jwt-simple");


/* GET users listing. */
router.get('/', async (req, res, next) => {
  try {
    let users = await Users.find({});
    res.json(Response.successResponse(users));
  }
  catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(Response.errorResponse(err))
  }
});

router.post("/register", async (req, res) => {// auth.checkRoles("user_add"), 
  let body = req.body;
  try {
    let user = await Users.findOne({ email: body.email });
    if (user) {
      return res.sendStatus(Enum.HTTP_CODES.BAD_REQUEST);
    }
    // if (!body.email) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user.language), i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user.language, ["email"]));

    if (is.not.email(body.email)) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Email formatı yanlış!");// i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user.language), i18n.translate("USERS.EMAIL_FORMAT_ERROR", req.user.language));
    //is paketini indirdik bunu indirerek format kontrolü sağlamış olduk

    if (!body.password) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Sifre alanı doldurulmalıdır");//i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user.language), i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user.language, ["password"]));

    if (body.password.length < Enum.PASS_LENGTH) {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Sifre en az 8 karakter olmalıdır");//i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user.language), i18n.translate("USERS.PASSWORD_LENGTH_ERROR", req.user.language, [Enum.PASS_LENGTH]));
    }

    // if (!body.roles || !Array.isArray(body.roles) || body.roles.length == 0) {
    //   throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user.language), i18n.translate("COMMON.FIELD_MUST_BE_TYPE", req.user.language, ["roles", "Array"]));
    // }

    // let roles = await Roles.find({ _id: { $in: body.roles } });

    // if (roles.length == 0) {
    //   throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user.language), i18n.translate("COMMON.FIELD_MUST_BE_TYPE", req.user.language, ["roles", "Array"]));
    // }

    let password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null);//8 girdik ne kadar büyük girersek okadar sağlam hashlaneir
    let createdUser = await Users.create({
      email: body.email,
      password,
      is_active: true,
      first_name: body.first_name,
      last_name: body.last_name,
      phone_number: body.phone_number
    });
    let role = await Roles.create({
      role_name: Enum.SUPER_ADMIN,
      is_active: true,
      created_by: createdUser._id
    });
    await UserRoles.create({
      role_id: role._id,
      user_id: createdUser._id
    });
    // for (let i = 0; i < roles.length; i++) {
    //   await UserRoles.create({
    //     role_id: roles[i]._id,
    //     user_id: user._id
    //   })
    // }

    res.status(Enum.HTTP_CODES.CREATED).json(Response.successResponse({ success: true }, Enum.HTTP_CODES.CREATED));//created 201 döner olumlu bir yanıttır eklediğinin bilgisini verir

  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});
router.post("/add", async (req, res) => {// auth.checkRoles("user_add"), 
  let body = req.body;
  try {

    if (!body.email) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user.language), i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user.language, ["email"]));

    if (is.not.email(body.email)) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Email formatı yanlış!");// i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user.language), i18n.translate("USERS.EMAIL_FORMAT_ERROR", req.user.language));
    //is paketini indirdik bunu indirerek format kontrolü sağlamış olduk

    if (!body.password) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Sifre alanı doldurulmalıdır");//i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user.language), i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user.language, ["password"]));

    if (body.password.length < Enum.PASS_LENGTH) {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Sifre en az 8 karakter olmalıdır");//i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user.language), i18n.translate("USERS.PASSWORD_LENGTH_ERROR", req.user.language, [Enum.PASS_LENGTH]));
    }

    if (!body.roles || !Array.isArray(body.roles) || body.roles.length == 0) {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Roller alanı bir array olmalıdır.");//i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user.language), i18n.translate("COMMON.FIELD_MUST_BE_TYPE", req.user.language, ["roles", "Array"]));
    }
    //bu roller aslında id dizisi olacak.rol tablosundaki idleri barındıracak. gerçekten idlere ait kayıtlar var mı diye kontrol etmemiz gerekiyor
    let roles = await Roles.find({ _id: { $in: body.roles } });//idsi .. olanlar diyeceksek in kullanıyoruz

    if (roles.length == 0) {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "validation Error!", "Roller alanı bir array olmalıdır");// i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user.language), i18n.translate("COMMON.FIELD_MUST_BE_TYPE", req.user.language, ["roles", "Array"]));
    }

    let password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null);//8 girdik ne kadar büyük girersek okadar sağlam hashlaneir

    let user = await Users.create({
      email: body.email,
      password,
      is_active: true,
      first_name: body.first_name,
      last_name: body.last_name,
      phone_number: body.phone_number
    });

    for (let i = 0; i < roles.length; i++) {
      await UserRoles.create({
        role_id: roles[i]._id,
        user_id: user._id
      })
    }

    res.status(Enum.HTTP_CODES.CREATED).json(Response.successResponse({ success: true }, Enum.HTTP_CODES.CREATED));//created 201 döner olumlu bir yanıttır eklediğinin bilgisini verir

  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});
router.post("/update", async (req, res) => {
  try {
    let body = req.body;
    let updates = {};
    if (!body._id) {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Id alanı doldurulmalıdır!");
    }
    if (body.password && body.password.length > Enum.PASS_LENGTH) {
      updates.password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null);
    }
    if (typeof body.is_active === "boolean") updates.is_active = body.is_active;
    if (body.first_name) updates.first_name = body.first_name;
    if (body.last_name) updates.last_name = body.last_name;
    if (body.phone_number) updates.phone_number = body.phone_number;

    if (Array.isArray(body.roles) && body.roles.length > 0) {
      let userRoles = await UserRoles.find({ user_id: body._id });
      let removedRoles = userRoles.filter(p => !body.roles.includes(p.role_id.toString()));
      let newRoles = body.roles.filter(p => !userRoles.map(p => p.role_id).includes(p));
      if (removedRoles.length > 0) {
        await UserRoles.deleteMany({ _id: { $in: removedRoles.map(p => p._id.toString()) } });
      }
      if (newRoles.length > 0) {
        for (let i = 0; i < newRoles.length; i++) {
          let priv = new UserRoles({
            role_id: newRoles[i],
            user_id:body._id
          });
          await priv.save();
        }
      }
    }


    await Users.updateOne({ _id: body._id }, updates);
    res.json(Response.successResponse({ success: true }));
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);

  }
})
router.post("/delete", async (req, res) => {
  let body = req.body;
  try {
    if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Id alanı doldurulmalıdır!");
    await Users.deleteOne({ _id: body._id });

    res.json(Response.successResponse({ success: true }));

  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

module.exports = router;
