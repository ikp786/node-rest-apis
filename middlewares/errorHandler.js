import { DEBUG_MODE } from '../config';
import { ValidationError } from 'joi';
import CustomErrorHandler from '../services/CustomErrirHandler';
const errorHandler = (err, req, res, next) => {
    let statsCode = 500;
    let data = {
        message: "Iternal Server error",
        ...(DEBUG_MODE === 'true' && { originalError: err.message })
    }
    if (err instanceof ValidationError) {
        statsCode = 422;
        data = {
            message: err.message
        }
    }
    if(err instanceof CustomErrorHandler){
        statsCode = err.status;
        data  = {
            message: err.message
        }
    }
    return res.status(statsCode).json(data);
}
export default errorHandler;