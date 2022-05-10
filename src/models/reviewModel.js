const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId
//const moment=require('moment')

const reviewSchema = new mongoose.Schema({

    bookId :{
        type : ObjectId,
        ref : "book",
        required : "Book-Id is Required"
    },
    reviewedBy: {
        type:String, 
        required:true,
        default: 'Guest',
       
    },
    reviewedAt:
    {
        type:Date,
        default:Date.now,
        required:true,
    },
    rating:{
        type:Number,
        min:1,
        max:5,
        required:true,

    },
    review:{
        type:String,
    },
    isDeleted : {
        type : Boolean,
        default : false
    }
},{timestamps: true})

module.exports = mongoose.model("Review", reviewSchema)
