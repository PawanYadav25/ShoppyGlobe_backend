// import express from "express";

import { Router } from "express";
import { login } from "../Controller/user.controller.js";
import { AllProducts,OneProducts, register, cart, itmcount,dltprd } from "../Controller/user.controller.js";
import VerifyJwtToken from "../middleware/VerifyJwtMiddleware.js";

const userRouter = Router();

userRouter.get("/login",login)                              //Login the User and get the JWT token
userRouter.get("/products",AllProducts)                     //Fetch all the product
userRouter.get("/products/:id",OneProducts)                 //Fetch single product by it's ID
userRouter.post("/register",register)                       //Register the new User
userRouter.post("/cart",VerifyJwtToken,cart)                //Insert the product in Cart to the use who has login
userRouter.put("/cart/:id",VerifyJwtToken,itmcount)         //Increase the count of product present in Cart
userRouter.delete("/cart/:id",VerifyJwtToken,dltprd)        //Remove the product from the Cart

export default userRouter