const express = require("express");
const Products = require('../models/product');
const {validateToken} = require('../authenticate');

const productRouter = express.Router();
productRouter.use(express.json());


productRouter.route('/')
    .get((req,res,next)=>{
        Products.find({})
            .then((products)=>{
                res.status(200).header('Content-Types', 'Application/json').json(products)
            })
            .catch((err)=>{
                res.status(403).send({
                    error: err,
                    message: "Something wrong happened"
                })
            })
    })
    .post(validateToken,(req,res,next)=>{
        Products.create(req.body)
         .then((product)=>{
             res.status(201).header('Content-Types', 'Application/json').json(product);
         })
         .catch((err)=>{
             res.status(403).json(err);
         })
    })
    .put((req,res,next)=>{
        res.json({
            "message": "put does not work"
        })
    })
    .delete((req,res,next)=>{
        res.status(401).json("Delete does not work for this");
    })

productRouter.route('/:productId')
    .get((req,res,next)=>{
        Products.findById(req.params.productId)
            .then((product)=>{
                res.status(200).header('Content-Types', 'Application/json').json(product);
            })
            .catch((err)=>{
                res.status(400).json(err);
            })
    })
    .post((req,res,next)=>{
        res.status(400).send("POST request does not work for this ");
    })
    .put((req,res,next)=>{
        Products.findByIdAndUpdate(req.params.productId, {
            $set: req.body
        },{
            new: true
        })
        .then((product)=>{
            res.status(200).header('Content-Types', 'Application/json').json(product);
        })
        .catch((err)=>{
            res.status(400).json(err);
        })
    })
    .delete(validateToken,(req,res,next)=>{
        Products.findByIdAndRemove(req.params.productId)
            .then((result)=>{
                res.status(200).header('Content-Types', 'Application/json').json(result);
            })
            .catch(err=>{
                res.json(err);
            })
    })





module.exports = productRouter;