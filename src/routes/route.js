const express = require('express');
const router = express.Router();
const userController=require('../controller/userController')
const bookController=require('../controller/bookController')
const reviewController=require('../controller/reviewController')


router.post('/register',userController.createUser);
router.post('/login',userController.loginUser);
router.post('/books',bookController.bookCreation);
router.post('/books/:bookId/review',reviewController.bookReview)
router.get("/books/:bookId", bookController.getBookById)



module.exports = router