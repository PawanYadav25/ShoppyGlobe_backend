import express from "express";
import user from "../Model/User_model.js";
import Products from "../Model/Products_model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Cart from "../Model/Cart_model.js";

const Salt = 10;  //for Hashing the password with salt

export const register = async (req,res)=>{                  //Registration for new user
    const {userName : UserNM, password: pswd} = req.body;   
    const data = await user.findOne({userName:UserNM})      //Find if same UserName is present or not 
    try {
        if(!data){                                                      // if same userName is not present then proceed the request
        const enpswd = await bcrypt.hash(pswd, Salt )                   // Hashing the pswd before data entry
        await user.insertOne({userName:UserNM, password:enpswd})        // insert the value in User collection
        await Cart.insertOne({UserName:UserNM})                         // For the same user add Cart with user name and empty Cart array where we store product for user
        return res.json({message : "User Registered Succesfully, Kindly login and order your favourite items"})   //Successfull insert Respond
    }
    res.status(200)                                              
    res.send(`${UserNM} already present, Kindly Login`)                 //if UserName is already present send the msg for login
    } catch (error) {
        res.status(500).json({"message":error.message});
    }
    
}

export const login = async (req,res)=>{                                 //Login controller
    const {userName : UserNM, password: pswd} = req.body;
    const data = await user.findOne({userName:UserNM})      //Find the userName is present or not
    if(!data){
        return res.status(404).json({message : 'User not registered or check your User Name'})  //If userName is not present as for Registration
    }
    const enpswd = await bcrypt.compare(pswd, data.password)  //If UserName present verify the Hashed pswd

    //If pswd is not corret send the password incorrect message
    if(!enpswd){
        return res.status(401).json({
            message : "password is not correct"
        })
    }
    var token = jwt.sign({userName: UserNM}, 'air',{expiresIn:"10m"});   //if all verification done and passed, create JWT token using Username
    res.status(200)
    res.json({"message":`password Matched`,generatedToken:token}); //send Response with TOken
    
}


export const AllProducts = async (req,res)=>{ //Get all the Products
    const data = await Products.find();  //Get all the products
    res.send(data);    // send the response with all Data
}


export const OneProducts = async (req,res)=>{      //Get the single Product base on the route
    const Fid = req.params.id;
    const data = await Products.findOne({id:Fid});   //Try to fetch data of the Product Id which is requested
    if(!data){
        return res.status(404).json({message:'product is not found please find valid Product ID'})  // if product is not present with that product ID 
    }
    const {id,title,description,category,price,discount,rating,stock} = data;  
    res.send({id,title,description,category,price,discount,rating,stock})  //Product is present with that Product ID send product detail with detail
}

export const cart =  async (req,res)=>{        // Addition of the product in the cart
    const user = req.userName['userName'];     // Once the Middleware Verify the token we get the USERName, of the login person
    const {id,title,description,category,price,discount,rating,stock,Count} = req.body; 
    const pdt = await Cart.findOne({UserName : user});     //Find that userName present in Cart or not
    const prdlst= await Products.find();                   //Get the list of all the products for compare
    const dupprd = pdt.Cart.filter(dt => dt.id == id)      //Check if that product is already present in user cart or not
    const prdchk = prdlst.filter(dt => dt.id == id)         //check the product is adding in the cart is listed in products or not
    if(prdchk.length > 0){
        if(dupprd.length > 0){
         return res.json({Message : "Product is already present in the cart"})  //if product is already present in user cart send this response
    }else{
    try {
                await Cart.updateOne({UserName : user},{$push:{Cart:{id,title,description,category,price,discount,rating,stock,Count}}})
                return res.status(200).json({message:"Item successfully added in your cart"})                       //if the product is not prsent and also listed in products list add the product in the cart
            } catch (error) {
                res.status(500).json({"message":error.message});
            }
        }
    }else{
        res.json({message:'Product is not available'})   //if product is not present on Products which are listed send this reponse
    }
}


export const itmcount = async (req,res)=>{      //increase the Product count
    const user = req.userName['userName'];      //Once the token is veified , we get the userName from the token
    const pid = req.params.id;                     //get the product id which count need to be update
    try {
        const data = await Cart.findOne({UserName:user})   //Find the userName, it is present in cart or not
        const fprd = data.Cart.filter(dt => dt.id == pid)  //check the requetsed count increase product is present in cart or not
        if(fprd.length > 0){
            await Cart.updateOne({UserName:user,"Cart.id": pid }, { $inc:{"Cart.$.Count":1}})    //increase the count if product is present
            res.status(200).json({message:`Product id - ${pid} count has been increased`}) 
        }else{
            return res.status(404).json({message : "Product is not added in the cart, kindly check the Product ID"})  //send this if requested product is not present in cart
        }
    } catch (error) {
        res.status(500).json({"message":error.message});
    }
}

export const dltprd = async (req,res)=>{        //Remove the products form the Cart
    const user = req.userName['userName'];       //Once token is verified we get user id from token
    const pid = req.params.id;                   //get the product ID that need to be remove
    try {
        const data = await Cart.findOne({UserName:user})  //find the user if it is present in Cart or not
        const fprd = data.Cart.filter(dt => dt.id == pid)   //find the Product which need to be remove
        if(fprd.length > 0){
            await Cart.updateOne({UserName:user}, {$pull :{Cart : {id: pid}}}) //if the requested cart is present remove the cart and send response
            res.status(200).json({message:`Product id - ${pid} has been removed`})
        }else{
            return res.status(404).json({message : "Product is not present for deletion"})  //If requested product is not present in Cart
        }
    } catch (error) {
        res.status(500).json({"message":error.message});
    }
}