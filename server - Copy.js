import express from "express";
import mongoose from "mongoose";
import path from "path";
var bodyParser = require('body-parser');
import multer from "multer";
import { APP_PORT ,DB_URL } from "./config";
import errorHandler from "./middlewares/errorHandler";
const app = express()
import routes from './routes';
var upload = multer();
// DATABASE CONNECTION
mongoose.connect(DB_URL, {
   
 });
const db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error:'))
db.once('open', () => {
    console.log('DB connected...');
});

global.appRoot = path.resolve(__dirname);
app.use(express.urlencoded({extended:false}));

// for parsing multipart/form-data
// app.use(upload.array()); 
// app.use(express.static('public'));
app.use('/uploads',express.static('uploads'));

app.use(express.json());
app.use('/api', routes);

app.use(bodyParser.json());
// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({
    extended: true
}));

const PUBLISHABLE_KEY = "pk_test_51Hf7QJATVJkAMhSGN07md87xPMeUrg2GIO4aL4OYr52x750uLoLJku6TNErDEqUTz81zXKJpxEx817DwomCr42sh00woKG0gDG";

const STRIPE_SECRET = "sk_test_51Hf7QJATVJkAMhSGXa03lgDWTwOondfAqs6LJ2fUZcs3p80jihpHtwpy2aGiZPfsyHyyBPwXdL8HLJDwrvZrI2J200avjer3od";

 const stripe = require('stripe')(STRIPE_SECRET);

app.set("view engine","ejs");

app.get('/',(req,res) =>{
res.render('Home',{
    key:PUBLISHABLE_KEY
})
});

app.get('/payment',async(req,res) =>{
  

    const token = await stripe.tokens.create({
        card: {
          number: '4242424242424242',
          exp_month: 8,
          exp_year: 2023,
          cvc: '314',
        },
      });   
          console.log(token);
      await stripe.customers.create({
          email:'khan@gmail.com',
          source:token.id,
          name:'Ibrahim Khan',
          address:{
              line1:'Jploft mansrovar',
              postal_code:'302020',
              city:'Jaipur',
              state:'Rajasthan',
              country:'India'
          }
      })
      .then((custmer) => {
          return stripe.charges.create({ 
              amount:7000,
              description:'web developer',
              currency:'USD',
              custmer:custmer.id
          })
      })
      .then((charge) => {
          console.log(charge);
          res.send(Success);
      })
      .catch((err) => {
          res.send(err)
      })

      
      
    });

app.post('/payment', async(req,res) => {
    // const token = await stripe.tokens.create({
    //   card: {
    //     number: '4242424242424242',
    //     exp_month: 8,
    //     exp_year: 2023,
    //     cvc: '314',
    //   },
    // });   
        console.log(req.body);
    await stripe.customers.create({
        email:req.body.stripeEmail,
        source:req.body.stripeToken,
        name:'Ibrahim Khan',
        address:{
            line1:'Jploft mansrovar',
            postal_code:'302020',
            city:'Jaipur',
            state:'Rajasthan',
            country:'India'
        }
    })
    .then((custmer) => {
        return stripe.charges.create({ 
            amount:7000,
            description:'web developer',
            currency:'USD',
            custmer:custmer.id
        })
    })
    .then((charge) => {
        console.log(charge);
        res.send(Success);
    })
    .catch((err) => {
        res.send(err)
    })

});

app.use(errorHandler);
app.listen(APP_PORT, () => console.log(`listening on porting ${APP_PORT}`))