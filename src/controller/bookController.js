const bookModel = require("../models/bookModel")
const userModel = require("../models/userModel")
const mongoose=require('mongoose')

const isValidRequestBody = function(requestBody){
    return Object.keys(requestBody).length > 0
}

const isValid = function(value){
    if(typeof value ==='undefined' || value === null)
    return false
    if(typeof value === 'string' && value.trim().length === 0)
    return false
    return true
}
const isValidObjectId = function(objectId){
    return mongoose.Types.ObjectId.isValid(objectId)
}

const bookCreation = async function(req,res){
    try
    {
        let details = req.body
        //nothing from body comes this execute
        if(!isValidRequestBody(details))
        return res.status(400).send({status:false, msg:"Please fill book details"})

        //details to be in body 
        let {title, excerpt,userId,ISBN,category,subcategory} = details

        //validation start
        if(!isValid(title))
        return res.status(400).send({status:false, msg:"TItle Name is Required"})
        //Check for uniquetitle in bookmodel
        let uniqueTitle = await bookModel.findOne({title})
        if(uniqueTitle)
        return res.status(400).send({status:false, msg:`${title} TItle name is already registered`})
        // nothing comes from body key of excerpt
        if(!isValid(excerpt))
        return res.status(400).send({status:false, msg:"excerpt is required"})
        //checking userID from body 
        if(!isValid(userId))
        return res.status(400).send({status:false, msg:"userId is Required"})
        if(!isValidObjectId(userId))
        return res.status(400).send({status:false, msg:"Please enter valid userId"})
        //checking for UniqueUserId from userModel
        let userData = details.userId 
        let UserId=await userModel.findById(userData) 
         if(!UserId)
         return res.status(400).send({status:false,msg:`${userId} this userid is not correct`})  
         //Isbn is not present in the body 
        if(!ISBN)
        return res.status(400).send({status:false,msg:"ISBN is required"})
        //uniqueISBN checking from bookmodel
        let uniqueISBN=await bookModel.findOne({ISBN})
        if(uniqueISBN)
        return res.status(400).send({status:false,msg:`${ISBN} is already exist please provide new one`})
        //category is not present in the body
        if(!category)
        return res.status(400).send({status:false,msg:'category is needed'})
        // subcategory is not present in the body
        if(!subcategory)
        return res.status(400).send({status:false,msg:'subcategory is required'})

        //creation of book with everything is working fine
        let bookCreation = await bookModel.create(details)
        res.status(201).send({status:true,message:"bookcreated successfully",data:bookCreation})
    }
    catch(err){
        console.log(err.message)
        res.status(500).send({status:false, msg:err.message})
    }
}

module.exports = {bookCreation}