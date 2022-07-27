import Joi from "joi";
import bcrypt from "bcrypt";
//import jwtService from '../../services/JwtService';
import { RefreshToken, User } from "../../models";
import CustomErrorHandler from "../../services/CustomErrirHandler";
// import JwtService from '../../services/JwtService';
import JwtService from "../../services/JwtService";
import { REFRESH_SECRET } from "../../config";
// import CustomErrorHandler from "../../services/CustomErrirHandler";
const registerController = {
  async register(req, res, next) {
    // validation
    const pattern =
      "/(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[$@$!#.])[A-Za-zd$@$!%*?&.]{8,20}/";

    const registerSchema = Joi.object({
      name: Joi.string().min(3).max(30).required(),
      email: Joi.string().email().required(),
      // password: Joi.string().regex(RegExp(pattern)), // you have to put it in this way and it will work :).required().min(8).max(20)
      // reapetpassword:Joi.ref(password),
      password: Joi.string().required(),
      reapetpassword: Joi.string().required().valid(Joi.ref("password")),
    });

    const { error } = registerSchema.validate(req.body);

    if (error) {
      return next(error);
    }

    // CHEK EMAIL ALRADY EXISTS
    try {
      const exist = await User.exists({ email: req.body.email });
      if (exist) {
        return next(
          CustomErrorHandler.alreadyExist("This email is already taken.")
        );
      }
    } catch (err) {
      return next(err);
    }
    const { name, email, password } = req.body;
    // hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // prepare model
    
    const user = new User ({
      name,
      email,
      password: hashPassword,
    });
    let access_token;
    let refresh_token;
    try {
      const result = await user.save();
      // console.log(result);
      //  CREATE JWT TOKEN

      access_token = JwtService.sign({ _id: result._id, role: result.role });
      refresh_token = JwtService.sign({ _id: result._id, role: result.role },'1y',REFRESH_SECRET);

      // database whitelist
      await RefreshToken.create({token: refresh_token});

    } catch (err) {
      return next(err);
    }

    res.json({ access_token,refresh_token });
  },
};

export default registerController;
