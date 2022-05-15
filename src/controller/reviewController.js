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


// ===================================  Post Review   ==========================================





const bookReview = async function (req, res) {
    try {
        let paramBookId = req.params.bookId
        let details = req.body

        // nothing from body it returns this
        if (!isValidRequestBody(details))
            return res.status(400).send({ status: false, msg: "Please fill body details" })
        //body consists of which is required
        let { rating, review, reviewedBy } = details
        details.bookId = paramBookId
        //validation start
        if (!isValid(paramBookId)) return res.status(400).send({ status: false, msg: "bookId is Required" })
        if (!isValidObjectId(paramBookId)) return res.status(400).send({ status: false, msg: "Please enter valid BookId" })
        let BookId = await bookModel.findById(paramBookId)
        if (!BookId) return res.status(404).send({ status: false, msg: "Book not foundt" })
        //checking for rating
        if (!isValid(rating)) return res.status(400).send({ status: false, msg: 'rating needed' })
        if (!(/[+]?([0-4]*\.[0-9]+|[0-5])/).test(details.rating))
            return res.status(400).send({ status: false, msg: 'rating is needed between 1 to 5' })
        //checking for review
        if (!isValid(review))
            return res.status(400).send({ status: false, msg: 'review is required' })
        //creation of review
        if (!isValid(reviewedBy)) {
            return res.status(400).send({ status: false, msg: "name of reviewer is required" })
        }
        let reviewCount = await bookModel.findOneAndUpdate({ _id: paramBookId }, { $inc: { reviews: 1 } }, { new: true }).lean()
        details.reviewedAt = new Date()
        let Review = await reviewModel.create(details)
        let reviewCreation = await reviewModel.findOne({ _id: Review._id }).select({ _v: 0, createdAt: 0, updatedAt: 0, isDeleted: 0 })
        reviewCount.reviewsData = reviewCreation
        return res.status(201).send({ status: true, message: "reviewcreated successfully", data: reviewCount })
    }
    catch (err) {
        console.log(err.message)
        res.status(500).send({ status: false, msg: err.message })
    }
}



//========================================== Update Review   ==================================



const updateReview = async function (req, res) {
    try {
        let bookid = req.params.bookId
        let review_id = req.params.reviewId
        if (!isValidObjectId(bookid)) {
            return res.status(400).send({ status: false, message: "please enter a valid bookid" })
        }
        let book = await bookModel.findOne({ _id: bookid, isDeleted: false }).lean()
        if (!book) {
            return res.status(404).send({ status: false, message: "No such book" })
        }

        if (!isValidObjectId(review_id)) {
            return res.status(400).send({ status: false, message: "please enter a valid reviewid" })
        }

        let reviews = await reviewModel.findOne({ _id: review_id, isDeleted: false })
        if (!reviews) {
            return res.status(404).send({ status: false, message: "No such review for this book" })
        }

        let info = req.body
        if (!isValidRequestBody(info)) {
            return res.status(400).send({ status: false, message: "please enter details" })
        }
        if (!isValid(info.reviewedBy)) {
            return res.status(400).send({ status: false, message: "please enter reviewedBy details" })
        }

        if (!isValid(info.review)) {
            return res.status(400).send({ status: false, message: "please enter review details" })
        }

        if (!isValid(info.rating)) {
            return res.status(400).send({ status: false, message: "please enter rating details" })
        }

        //======regex=/[+]?([0-4]*\.[0-9]+|[0-5])/====for rting===================
        if (!(/^[1-5]?[0-9]{1}$|^5$/).test(info.rating))
            return res.status(400).send({ status: false, msg: 'rating is needed between 1 to 5' })
        // we have to write regex for rating after validating rating.

        let update = await reviewModel.findOneAndUpdate({ _id: review_id, }, { $set: { review: info.review, rating: info.rating, reviewedBy: info.reviewedBy } }, { new: true })
        book.reviewsData = update
        return res.status(200).send({ status: true, message: "Updated successfully", data: book })
    }
    catch (err) {
        console.log(err.message)
        res.status(500).send({ status: false, msg: err.message })
    }
}




//=========================================  Delete Review  =======================================



const deleteReview = async function (req, res) {
    try {
        let bookid = req.params.bookId
        let reviewid = req.params.reviewId
        //Validate book id
        if ((!isValidObjectId(bookid))) {
            return res.status(400).send({ status: false, msg: "BookId not valid" })
        }
        //Validate review id
        if (!isValidObjectId(reviewid)) {
            return res.status(400).send({ status: false, msg: "review not valid" })
        }
        let book = await bookModel.findOne({ _id: bookid, isDeleted: false })
        if (!book) {
            return res.status(404).send({ status: false, msg: "BookId doesnot exist that means book is deleted" })
        }
        let Review = await reviewModel.findOne({ _id: reviewid, isDeleted: false })
        if (!Review) {
            return res.status(404).send({ status: false, msg: "reviewId doesnot exist that means review is deleted" })
        }

        let deleteReview = await reviewModel.findOneAndUpdate({ _id: reviewid, bookId: bookid, isDeleted: false }, { isDeleted: true })
        if (!deleteReview) return res.status(400).send({ status: false, msg: "make sure that reviewId is belong to that bookid" })
        if (deleteReview) {
            let deletedData = await bookModel.findOneAndUpdate({ _id: bookid }, { $inc: { reviews: -1 } }, { new: true })
            return res.status(200).send({ status: true, msg: "Review is deleted successfully" })
        }
        else {
            return res.status(400).send({ status: false, msg: "Review not exist" })
        }

    }
    catch (err) {
        console.log("This is the error :", err.message);
        res.status(500).send({ msg: "Error", error: err.message });
    }
}


module.exports = { bookReview, updateReview, deleteReview }