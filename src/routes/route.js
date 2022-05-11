const express = require('express');
const router = express.Router();
const userController=require('../controller/userController')
const bookController=require('../controller/bookController')
const reviewController=require('../controller/reviewController')


router.post('/register',userController.createUser);
router.post('/login',userController.loginUser);
router.post('/books',bookController.bookCreation);

router.put('/books/:bookId',bookController.updateBooks)
router.delete('/books/:bookId',bookController.deleteBook)
router.post('/books/:bookId/review',reviewController.bookReview)
router.get("/books/:bookId", bookController.getBookById)
router.put("/books/:bookId/review/:reviewId",reviewController.updateReview)


module.exports = router