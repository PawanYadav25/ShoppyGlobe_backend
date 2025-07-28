import mongoose from "mongoose";
import { Schema } from "mongoose";

const AllProducts = new Schema({
    id : {
        type: String,
        required : true
    },
title : String,
description : String,
category : String,
price : String,
discount : String,
rating : String,
stock : String
})


const Products = mongoose.model('AllProducts', AllProducts);

export default Products;