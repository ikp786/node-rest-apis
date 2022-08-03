import { Product  } from '../models';
import multer from 'multer';
import path from 'path';
import Joi from 'Joi';

import CustomErrorHandler from '../services/CustomErrirHandler';
import fs from "fs";
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null,'uploads/'),
    filename: (req, file, cb) => {
       const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null,uniqueName);
    }
});


const handleMultipartdata = multer({storage, limits:{fileSize: 1000000 * 5 }}).single('image') // 5mb


const productController = {
    async store(req,res,next){
        // multipart form data
        handleMultipartdata(req,res, async (err) => {
            if(err){
                return next(CustomErrorHandler.serverError(err.message))
            }            
            let document;
            const filePath = req.file.path;
            //validatoin
            
                const productSchema = Joi.object({
                  name: Joi.string().required(),      
                  price: Joi.number().required(),      
                  size: Joi.string().required(),                                     
                });
            const { error } = productSchema.validate(req.body);
            if(error){
                fs.unlink(`${appRoot}/${filePath}`, (err) => {      
                    if(err){
                return next(CustomErrorHandler.serverError(err.message));
                    }
                });
                return next(error);
            }

            const {name,price,size} = req.body;

            try {
                document = await Product.create({
                    name,
                    price,
                    size,
                    image:filePath
                });
            } catch (err) {
                return next(err);
            }            
            res.status(201).json(document);
        });
    }
};

export default productController;
