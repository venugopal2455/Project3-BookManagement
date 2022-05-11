const bookModel = require("../models/bookModel")
const userModel = require("../models/userModel")
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

const bookCreation = async function (req, res) {
    try {
        let details = req.body
        //nothing from body comes this execute
        if (!isValidRequestBody(details))
            return res.status(400).send({ status: false, msg: "Please fill book details" })

        //details to be in body 
        let { title, excerpt, userId, ISBN, category, subcategory } = details

        //validation start
        if (!isValid(title))
            return res.status(400).send({ status: false, msg: "TItle Name is Required" })
        //Check for uniquetitle in bookmodel
        let uniqueTitle = await bookModel.findOne({ title })
        if (uniqueTitle)
            return res.status(400).send({ status: false, msg: `${title} TItle name is already registered` })
        // nothing comes from body key of excerpt
        if (!isValid(excerpt))
            return res.status(400).send({ status: false, msg: "excerpt is required" })
        //checking userID from body 
        if (!isValid(userId))
            return res.status(400).send({ status: false, msg: "userId is Required" })
        if (!isValidObjectId(userId))
            return res.status(400).send({ status: false, msg: "Please enter valid userId" })
        //checking for UniqueUserId from userModel
        let userData = details.userId
        let UserId = await userModel.findById(userData)
        if (!UserId)
            return res.status(400).send({ status: false, msg: `${userId} this userid is not correct` })
        //Isbn is not present in the body 
        if (!ISBN)
            return res.status(400).send({ status: false, msg: "ISBN is required" })
        //uniqueISBN checking from bookmodel
        let uniqueISBN = await bookModel.findOne({ ISBN })
        if (uniqueISBN)
            return res.status(400).send({ status: false, msg: `${ISBN} is already exist please provide new one` })
        //category is not present in the body
        if (!category)
            return res.status(400).send({ status: false, msg: 'category is needed' })
        // subcategory is not present in the body
        if (!subcategory)
            return res.status(400).send({ status: false, msg: 'subcategory is required' })

        //creation of book with everything is working fine
        let bookCreation = await bookModel.create(details)
        res.status(201).send({ status: true, message: "bookcreated successfully", data: bookCreation })
    }
    catch (err) {
        console.log(err.message)
        res.status(500).send({ status: false, msg: err.message })
    }
}


const getBookById = async function (req, res) {
    try {
        let bookid = req.params.bookId

        if (!isValid(bookid)) {
            return res.status(400).send({ status: false, message: "bookid is required" })
        }

        if (!isValidObjectId(bookid)) {
            return res.status(400).send({ status: false, message: "bookid is not a valid objectId" })
        }

        let book = await bookModel.findOne({ _id: bookid })
        if (!book) {
            return res.status(404).send({ status: false, message: "no such book is available " })
        }
        if (book.isDeleted == true) {
            return res.status(404).send({ status: false, message: "book not found " })
        }

        let review1 = await reviewModel.find({ bookId: book._id, isDeleted: false }).select({ _id: 1, bookId: 1, reviewedBy: 1, reviewedAt: 1, rating: 1, review: 1 })
        //  if(review.length==0) {
        //      return res.status(400).send({status:false, message:"there is no review of this book"})
        //  }
        let getlist =
        {
            _id: book._id,
            title: book.title,
            userId: book.userId,
            category: book.category,
            subcategory: book.subcategory,
            isDeleted: book.isDeleted,
            reviews: book.reviews,
            deletedAt: book.deletedAt,
            releasedAt: book.releaseAt,
            createdAt: book.createdAt,
            updatedAt: book.updatedAt,
            reviewsData: review1
        }

        return res.status(200).send({ status: true, message: "Books list", data: getlist })

    }
    catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}


const updateBooks = async function (req, res) {

    try {
        const data = req.body
        if (!isValid(data)) return res.status(400).send({ status: false, message: "Please Provide Valid Input Details" });

        const bookId = req.params.bookId

        // if (!(isValid(bookId))) { return res.status(400).send({ status: false, message: "bookId is required" }) }
        if (!isValidObjectId(bookId)) { return res.status(400).send({ status: false, message: "Valid bookId is required" }) }

        // if (!isValid(data.title)) { return res.status(400).send({ status: false, message: 'Book Title is required' }) }

        const newTitle = await bookModel.findOne({ title: data.title });
        if (newTitle) { return res.status(400).send({ status: false, message: "Title  already registered" }) }

        // if (!isValid(data.excerpt)) { return res.status(400).send({ status: false, message: 'Excerpt is required' }) }

        const newExcerpt = await bookModel.findOne({ excerpt: data.excerpt })
        if (newExcerpt) { return res.status(400).send({ status: false, ERROR: "excerpt already exist" }) }

        // if (!isValid(data.ISBN)) { return res.status(400).send({ status: false, message: "ISBN is required" }) }
        if (!(/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/.test(data.ISBN))) {
            return res.status(400).send({ status: false, ERROR: "ISBN is not valid" })
        }

        const newISBN = await bookModel.findOne({ ISBN: data.ISBN });
        if (newISBN) { return res.status(400).send({ status: false, message: "ISBN  already registered" }) }



        if (!isValid(data.releasedAt)) { return res.status(400).send({ status: false, message: 'enter the released date of the book' }) }
        if (!(/^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/.test(data.releasedAt))) {
            return res.status(400).send({ status: false, message: "released Date is not valid" })
        }
        // const releasedAt = new Date().toISOString().slice(0, 10);
        // if(!(data.releasedAt)){
        //     return res.status(400).send({ status: false, message: "today's date should be in yyyy-mm-dd format" })
        // }




        let bookDetails = await bookModel.findOne({ _id: bookId })

        if (!bookDetails) {
            return res.status(400).send({ status: false, message: "Book Not Found" })
        }

        if (bookDetails.isDeleted == true) {
            return res.status(400).send({ status: false, message: "book is already deleted" })
        }
        else {
            let updatedBook = await bookModel.findByIdAndUpdate({ _id: bookId },
                { $set: { title: data.title, excerpt: data.excerpt, releasedAt: data.releasedAt, ISBN: data.ISBN } },
                { new: true })

            return res.status(200).send({ Status: true, data: updatedBook })

        }

    } catch (error) {
        res.status(500).send({ status: false, ERROR: error.message })
    }
}



const deleteBook = async function (req, res) {
    try {
        const bookId = req.params.bookId;
        // if (!isValid(bookId)) { return res.status(400).send({ status: false, message: "No Data Found" }) }

        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: "book id is invalid" })
        }


        const bookDetails = await bookModel.findById({ _id: bookId })

        if (!bookDetails) {
            return res.status(404).send({ status: false, message: "No Book Found" })
        }

        if (bookDetails.isDeleted === true) {
            return res.status(400).send({ status: false, messege: "the book is already deleted" })
        }
        else {
            const deleteData = await bookModel.findOneAndUpdate({ _id: bookId },
                { $set: { isDeleted: true, deletedAt: Date.now() } },
                { new: true })
                return res.status(200).send({ status: true, messege: "the book is deleted now" })

        }
        // if (bookDetails.isDeleted == false) {
        //     const deleteData = await bookModel.findOneAndUpdate({ _id: bookId },
        //                 { $set: { isDeleted: true,deletedAt: Date.now()} },
        //                 { new: true })
        //     return res.status(200).send({ status: true, messege: "the book is deleted now" })
        // }

        
    }

    catch (err) {
        return res.status(500).send({ status: false, Error: err.message })
    }

}




module.exports = { bookCreation, getBookById }
module.exports.updateBooks = updateBooks;
module.exports.deleteBook = deleteBook;