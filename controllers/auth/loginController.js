import Joi from "joi";
import { RefreshToken, User } from "../../models";
import bcrypt  from 'bcrypt';
import CustomErrorHandler from "../../services/CustomErrirHandler";
import JwtService from "../../services/JwtService";
import { REFRESH_SECRET } from "../../config";


const loginController = {

    async login(req,res,next){
        const loginSchema = Joi.object({
      email: Joi.string().email().required(),      
      password: Joi.string().required(),
        });
    const { error } = loginSchema.validate(req.body);
    if (error) {
        return next(error);
      }

      try {
        const user = await User.findOne({email:req.body.email});
        if(!user){
            return next(CustomErrorHandler.wrongCredentials());
        }
        const match = await bcrypt.compare(req.body.password,user.password);
        if(!match){
            return next(CustomErrorHandler.wrongCredentials());
        }
        // Token
      const access_token = JwtService.sign({ _id: user._id, role: user.role });

      const refresh_token = JwtService.sign({ _id: user._id, role: user.role },'1y',REFRESH_SECRET);

      // database whitelist
      await RefreshToken.create({token: refresh_token});

      res.json({access_token,refresh_token})

      } catch (err) {
        return next(err);
      }

    }

};

export default loginController;