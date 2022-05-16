const bookModel = require("../models/bookModel")
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


// ===================================  Post Review   ==============================





const bookReview = async function (req, res) {
    try {
        let paramBookId = req.params.bookId
        let details = req.body
        details.bookId = paramBookId
        // nothing from body it returns this
        if (!isValidRequestBody(details))
            return res.status(400).send({ status: false, msg: "Please fill body details" })
        //body consists of which is required
        let { rating, review, reviewedBy, bookId} = details
        //validation start
     let requestBody = {};
        if (!isValidObjectId(paramBookId)) {
        return res.status(400).send({ status: false, msg: "Please enter valid BookId" })
        }
        let BookId = await bookModel.findById(paramBookId)
        if (!BookId) {
        return res.status(404).send({ status: false, msg: "Book not foundt" })
        }
    if("reviewedBy" in details){
   if(!isValid(reviewedBy)){
    return res.status(400).send({ status: false, msg: 'reviewedBY is required' })

   }
   requestBody["reviewedBy"]= reviewedBy
}


    if("rating" in details){

        if (!isValid(rating)) return res.status(400).send({ status: false, msg: 'rating needed' })
        if (!(rating >= 1 && rating <= 5)) {
            return res.status(400).send({ status: true, mag: "rating should be between 1 and 5" })
        }
    requestBody["rating"] = rating

    }

        //checking for review
        if("review" in details){
        if (!isValid(review)){
            return res.status(400).send({ status: false, msg: 'review is required' })
        }

     requestBody["review"] = review

    }
    if("bookId" in details){
       requestBody["bookId"]= bookId
    }

        let reviewCount = await bookModel.findOneAndUpdate({ _id: paramBookId }, { $inc: { reviews: 1 } }, { new: true }).lean()
        requestBody.reviewedAt = new Date()
        let Review = await reviewModel.create(requestBody)
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
        const { reviewedBy, review, rating } = info

        let requestBody = {};

        if (!isValidRequestBody(info)) {
            return res.status(400).send({ status: false, message: "please enter details" })
        }
        if ("reviewedBy" in info) {
            if (!isValid(reviewedBy)) {
                return res.status(400).send({ status: false, message: "please enter reviewedBy details" })

        }
            requestBody["reviewedBy"] = reviewedBy
        }

        if ("review" in info) {

            if (!isValid(review)) {
                return res.status(400).send({ status: false, message: "please enter review details" })
            }
            requestBody["review"] = review
        }
        if ("rating" in info) {

            if (!isValid(rating)) {
                return res.status(400).send({ status: false, message: "please enter rating details" })
            }
            if (!(rating >= 1 && rating <= 5)) {
                return res.status(400).send({ status: true, mag: "rating should be between 1 and 5" })
            }

            requestBody["rating"] = rating

        }



        let update = await reviewModel.findOneAndUpdate({ _id: review_id, }, { $set: requestBody }, { new: true }).select({ _id: 1, bookId: 1, reviewedBy: 1, reviewedAt: 1, rating: 1, review: 1 })
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