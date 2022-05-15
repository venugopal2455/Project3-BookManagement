const express = require('express');
const router = express.Router();
const userController=require('../controller/userController')
const bookController=require('../controller/bookController')
const reviewController=require('../controller/reviewController')
const mid = require("../middleware/allMiddleware")


router.post('/register',userController.createUser);

router.post('/login',userController.loginUser);

router.post('/books',bookController.bookCreation);

router.get("/books",bookController.getBooks)

router.get("/books/:bookId",mid.authentication, bookController.getBookById)

router.put('/books/:bookId', bookController.updateBooks)

router.delete('/books/:bookId',mid.authentication,mid.authorization1,bookController.deleteBook)

router.post('/books/:bookId/review',reviewController.bookReview)

router.put("/books/:bookId/review/:reviewId",reviewController.updateReview)

router.delete("/books/:bookId/review/:reviewId",reviewController.deleteReview)

module.exports = router