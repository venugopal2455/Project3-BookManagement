const express = require('express');
const router = express.Router();



router.post("/", collegeController.createCollege)
router.post("/functionup/interns", internController.createIntern)
router.get("/functionup/collegeDetails", internController.getList)

module.exports = router