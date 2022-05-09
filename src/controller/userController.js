const userModel = require("../models/userModel")
const jwt = require("jsonwebtoken")

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValidTitle = function (title) {
    return ['Mr', 'Mrs', 'Miss'].indexOf(title) !== -1
}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

const loginUser = async function (req, res) {
    try {
        const requestBody = req.body;
        if (!isValidRequestBody(requestBody)) {
            res.status(500).send({ status: false, message: "Invalid request parameters please provide login details" })
            return
        }

        const { email, password } = requestBody;
        if (!isValid(email)) {
            res.status(400).send({ status: false, message: "Email is required" })
            return
        }

        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
            res.status(400).send({ status: false, message: "Email should be a valid email address" })
            return
        }

        if (!isValid(password)) {
            res.status(400).send({ status: false, message: "password is required" })
            return
        }

     

        const user = await userModel.findOne({ email, password });
        if (!user) {
            res.status(401).send({ status: false, message: "Invalid login credentials" });
            return
        }

        const token = jwt.sign({
            userId: user._id,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 10 * 60 * 60
        }, 'somesecureprivatekey')
        res.header('x-api-key', token)
        res.status(200).send({ status: true, message: "User login successfull", data: token })
    }

    catch (error) {
        res.status(500).send({ status: false, message: error.message })

    }
}

module.exports.loginUser=loginUser