const jwt = require("jsonwebtoken");
const bookModel = require("../models/bookModel");
const mongoose = require("mongoose")

const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}

const authentication = function ( req, res, next) {
    try{
        let token = (req.headers["x-user-key"]); 

        if(!token){
            return res.status(400).send({error : "Token must be present...!"});
        }

        let decodedToken = jwt.verify(token, 'somesecureprivatekey');

        if (!decodedToken){
            return res.status(400).send({ status: false, msg: "Token is invalid"});
        }
          
        let userLoggedIn = decodedToken.userId;
        req["userId"] = userLoggedIn;
        next();
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}


const authorization1 = async function(req,res,next){
    try{
        let bookId = req.params.bookId;
        let id = req.userId;
        if(!isValidObjectId(bookId)){
            return res.status(400).send({ status: false, msg: "Please enter valid bookId" })
         }
         let book = await bookModel.findOne({_id:bookId, isDeleted:false});
        if(!book){
            return res.status(404).send({ status: false, message: "No such book" }) 
        }
        if(id != book.userId){
            return res.status(403).send({status: false , msg : "Not authorized..!" });
        }
        next();
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

const authorization2 = async function(req,res,next){
    try{
        let createId = req.body.userId;
        let id = req.userId;
        if(!isValidObjectId(createId)){
            return res.status(400).send({ status: false, msg: "Please enter valid userId" })
         }
        if(id != createId){
            return res.status(403).send({status: false , msg : "Not authorized..!" });
        }
        next();
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

module.exports = {authentication,authorization1,authorization2}

