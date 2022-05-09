const userModel = require("../models/userModel")
const jwt = require("jsonwebtoken")





//validation.....................................................................
const isValid = function (value) {
    if (typeof value == undefined || value == null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    if (typeof value === 'Number' && value.toString().trim().length === 0) return false
    return true
}



//Create author.....................................................................
const createUser = async function (req, res) {
    try {

        let data = req.body;
        if (Object.keys(data).length == 0) { return res.status(400).send({ status: false, message: "Please Provide Valid Input Detailsr" }) }

        if (!isValid(data.title)) { return res.status(400).send({ status: false, message: "Title must be:['Mr', 'Mrs', 'Miss'] " }) }


        if (!isValid(data.name)) { return res.status(400).send({ status: false, message: "Name is required" }) }
        if (!isValid(data.phone)) { return res.status(400).send({ status: false, message: "Phone Number is required" }) }


        if (!(/^[6-9]\d{9}$/.test(data.phone))) {
            return res.status(400).send({ status: false, message: "phone number should be valid number" })
        }

        if (!isValid(data.email)) { return res.status(400).send({ status: false, message: "Email-Id is required" }) }

        if  (!(/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/.test(data.email))) {
            return res.status(400).send({ status: false, message: "Email should be a valid email address" })
        }
        //---------------------------check email duplicacy---------------------------------------//
        let checkEmail = await userModel.findOne({ email: data.email })
        if (checkEmail) { return res.status(400).send({ message: "Email Already exist" }) }

        //---------------------------check phone duplicacy---------------------------------------//
        let checkPhone = await userModel.findOne({ phone: data.phone })
        if (checkPhone) { return res.status(400).send({ message: "phone Already exist" }) }

        if (!isValid(data.password)) {
            return res.status(400).send({ status: false, message: "Password is required" })
        }

        if (!(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(data.password))) {
            return res.status(400).send({ status: false, message: "Password need minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character" })
        }

        if (!(/^[1-9]\d{5}$/.test(data.address.pincode))){
            return res.status(400).send({ status: false, message: "Please enter valid Pincode" })
        }

        let savedData = await userModel.create(data)

        return res.status(201).send({ status: true, data: savedData })

    }
    catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

//=================================================loginUser=========================================


const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

const loginUser = async function (req, res) {
    try {
        const requestBody = req.body;
     let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
     let regex1 = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/
        if (!isValidRequestBody(requestBody)) {
            res.status(500).send({ status: false, message: "Invalid request parameters please provide login details" })
            return
        }

        const { email, password } = requestBody;
        if (!isValid(email)) {
            res.status(400).send({ status: false, message: "Email is required" })
            return
        }

        if (!regex.test(email)) {
            res.status(400).send({ status: false, message: "Email should be a valid email address" })
            return
        }

        if (!isValid(password)) {
            res.status(400).send({ status: false, message: "password is required" })
            return
        }
        // const valid = password.length;
        // if (!(valid >= 8 && valid <= 15)) return res.status(400).send({ status: false, message: "Please Enter valid Password" });
        if (!regex1.test(password)) {
            res.status(400).send({ status: false, message: "password is invalid" })
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
        res.header('x-user-key', token)
        res.status(200).send({ status: true, message: "User successfully logged in", data: token })
    }

    catch (error) {
        res.status(500).send({ status: false, message: error.message })

    }
}

module.exports.createUser = createUser;
module.exports.loginUser=loginUser;
