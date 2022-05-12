const bookModel = require("../models/bookModel")
//const userModel = require("../models/userModel")
const reviewModel = require("../models/reviewModel")
const mongoose = require('mongoose')

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null)
        return false
    if (typeof value === 'string' && value.trim().length === 0)
        return false
    return true
}
const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}


// =================================================post review===================================
const bookReview = async function (req, res) {
    try {
        let paramBookId = req.params.bookId
        let details = req.body
        
        // nothing from body it returns this
        if (!isValidRequestBody(details))
            return res.status(400).send({ status: false, msg: "Please fill body details" })
        //body consists of which is required
        let { bookId, reviewedBy, rating, review } = details

        //validation start
        if (!isValid(paramBookId)) return res.status.send({ status: false, msg: "please enter bookId in params" })
        if (!isValid(bookId))
            return res.status(400).send({ status: false, msg: "bookId is Required" })
        if (!isValidObjectId(bookId))
            return res.status(400).send({ status: false, msg: "Please enter valid BookId" })

        //checking for UniqueBookId
        //if bookid and params bookid is same different
        if (paramBookId === bookId) {
            let bookData = details.bookId

            let BookId = await bookModel.findById(bookData)
            // if book is deleted then return this
            if (BookId.isDeleted)
                return res.status(400).send({ status: false, message: "this book is deleted" })
            //if its book not deleted then it is return this
            if (!BookId)
                return res.status(400).send({ status: false, msg: `${bookId} this bookid is not correct` })
        }
        else {
            return res.status(400).send({ status: false, msg: "both bookid's are different" })
        }
        //checking for reviewedBy
        if (!reviewedBy)
            return res.status(400).send({ status: false, msg: "reviewed by is required" })
        //checking for rating
        if (!rating)
            return res.status(400).send({ status: false, msg: 'rating is needed' })
        //checking for review
        if (!review)
            return res.status(400).send({ status: false, msg: 'review is required' })

        //creation of review
        // let reviewCreation = await reviewModel.create(details)
        // res.status(201).send({ status: true, message: "reviewcreated successfully", data: reviewCreation })
        let reviewCount= await bookModel.findOneAndUpdate({_id: paramBookId}, {$inc: {reviews: 1}}, {new: true})
       
        details.bookId = reviewCount._id;
        details.reviewedAt = new Date()
       
        let Review = await reviewModel.create(details)
        
        let reviewCreation = await reviewModel.findOne({ id: Review._id }).select({_v:0,createdAt: 0, updatedAt: 0, isDeleted: 0 })
        return res.status(201).send({ status: true,message: "reviewcreated successfully", data: reviewCreation})
    }
    catch (err) {
        console.log(err.message)
        res.status(500).send({ status: false, msg: err.message })
    }}
//=================================updateReview=======================================================================
const updateReview = async function (req, res) {
    try {
        let bookid = req.params.bookId
        let review_id = req.params.reviewId
        console.log(review_id)
        if (!isValidObjectId(bookid)) {
            return res.status(400).send({ status: false, message: "please enter a valid bookid" })
        }

        let book = await bookModel.findOne({ _id: bookid , isDeleted:false})
        if (!book) {
            return res.status(404).send({ status: false, message: "No such book" })
        }

        if (!isValidObjectId(review_id)) {
            return res.status(400).send({ status: false, message: "please enter a valid review_i" })
        }

        let reviews = await reviewModel.findOne({_id:review_id, isDeleted:false})
        if (!reviews) {
            return res.status(404).send({ status: false, message: "No such review for this book" })
        }

        let info = req.body
        if (!isValidRequestBody(info)) {
            return res.status(400).send({ status: false, message: "please enter details" })
        }

        if (!isValid(info.review)) {
            return res.status(400).send({ status: false, message: "please enter review details" })
        }

        if (!isValid(info.rating)) {
            return res.status(400).send({ status: false, message: "please enter rating details" })
        }
        if(info.rating <= 5 && info.rating >= 1){

         return res.status(400).send({ status: false, message: "you can not give rating greater than 5 or less than 1" })
        }
        // we have to write regex for rating after validating rating.
        if (!isValid(info.reviewedBy)) {
            return res.status(400).send({ status: false, message: "please enter reviewedBy details" })
        }

        let update = await reviewModel.findOneAndUpdate({ _id: review_id, }, { $set: { review: info.review, rating: info.rating, reviewedBy: info.reviewedBy } }, { new: true })
        return res.status(200).send({ status: true, message: "Updated successfully", data: update })
    }
    catch (err) {
        console.log(err.message)
        res.status(500).send({ status: false, msg: err.message })
    }
}


module.exports = { bookReview, updateReview }