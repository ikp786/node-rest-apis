import Joi from 'joi';
import { User } from '../../models';
import CustomErrorHandler from '../../services/CustomErrirHandler';
const registerController = {
   async register(req, res, next) {

        // validation
        const pattern = "/(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[$@$!#.])[A-Za-zd$@$!%*?&.]{8,20}/";

        const registerSchema = Joi.object({
            name: Joi.string().min(3).max(30).required(),
            email: Joi.string().email().required(),
            // password: Joi.string().regex(RegExp(pattern)), // you have to put it in this way and it will work :).required().min(8).max(20)
            // reapetpassword:Joi.ref(password),
            password: Joi.string().required(),
            reapetpassword: Joi.string().required().valid(Joi.ref('password')),
        });
        
        const { error } = registerSchema.validate(req.body)

        if (error) {
            return next(error);
        }

        // CHEK EMAIL ALRADY EXISTS
        try {
            const exist = await User.exists({email: req.body.email});
            if(exist){
                return next(CustomErrorHandler.alreadyExist('This email is already taken.'));
            }
        } catch (err) {
            return next(err);
        }

        res.json({ msg: "hello from express" });
    }
}


export default registerController;