import { Product  } from '../models';
import multer from 'multer';
import path from 'path';

import CustomErrorHandler from '../services/CustomErrirHandler';
import fs from "fs";
import productSchema from '../validators/productValidator';
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null,'uploads/'),
    filename: (req, file, cb) => {
       const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null,uniqueName);
    }
});
const handleMultipartdata = multer({storage, limits:{fileSize: 100000 * 5 }}).single('image') // 5mb

const productController = {
    async store(req,res,next){
        // multipart form data
        handleMultipartdata(req,res, async (err) => {   
            let document;         
            if(err){
                return next(CustomErrorHandler.serverError(err.message))
            }                      
            const filePath = req.file.path;
            //validatoin                          
            const { error } = productSchema.validate(req.body);
            if(error){
        if(req.file){
                fs.unlink(`${appRoot}/${filePath}`, (err) => {      
                    if(err){
                return next(CustomErrorHandler.serverError(err.message));
                    }
                });
            }
                return next(error);
            }
            const {name,price,size} = req.body;
const productData = new Product({
    name,
    price,
    size,
    
    ...(req.file && {image:filePath})
    
});
            try {
                document = await productData.save();
                console.log(document);
            } catch (err) {
                return next(err);
            }            
            res.status(201).json(document);
        });
    },
    async update(req,res,next){
        // multipart form data
        handleMultipartdata(req,res, async (err) => {
            if(err){
                return next(CustomErrorHandler.serverError(err.message))
            }            
         
            let filePath;
            if(req.file){
                filePath = req.file;
            }

            const { error } = productSchema.validate(req.body);            
            if(error){
                fs.unlink(`${appRoot}/${filePath}`, (err) => {      
                    if(err){
                        console.log(err.message);
                return next(CustomErrorHandler.serverError(err.message));
                    }
                });
                return next(error);
            }

            const {name,price,size} = req.body;
               let document;
            try {
                document = await Product.findOneAndUpdate({_id: req.params.id},{
                    name,
                    price,
                    size,
                    ...(req.file && {image:filePath.path.toString()})
                },{new: true });
            } catch (err) {
                return next(err);
            }            
            res.status(201).json(document);
        });
    },
    
    async destroy(req,res,next){
        const document = await Product.findByIdAndRemove({_id: req.params.id});
        // console.log(document.doc);
        if(!document){
            return next(new Error('Nothing to delete'));
        }
        // image delete
        const imagePath = document._doc.image;
        fs.unlink(`${appRoot}/${imagePath}`,(err) => {
            if(err){
                return next(CustomErrorHandler.serverError());
            }
        });
        return res.json(document);

    },
    async index(req,res,next){
        let document;
        // pagination. mongoose-pagination
        try {
            document = await Product.find().select('-updatedAt -__v').sort({_id:-1});
            
        } catch (err) {
            return next(CustomErrorHandler.serverError());
        }
        // return res.json(document);
        res.status(201).json(document);
    },
    async show(req,res,next){
        let document;
        // pagination. mongoose-pagination
        try {
            document = await Product.find({_id: req.params.id}).select('-updatedAt -__v');
            
        } catch (err) {
            return next(CustomErrorHandler.serverError());
        }
        return res.json(document);
    }
};

export default productController;
