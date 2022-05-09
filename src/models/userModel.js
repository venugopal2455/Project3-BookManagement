const mongoose = require("mongoose");


const userSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      enum: ["Mr", "Mrs", "Miss"],
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      match: [/^[6-9]\d{9}$/, "please fill a valid mobile Number"],
      unique: true
    },
    email: {
      type: String,
      required: true,
      match: [ /^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/, 'Please fill a valid email address'],
      unique: true,
      
    },
    password: {
      type: String,
      required: true,
      match:[/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/,'Please enter valid Password'],
      minlen:8,
      maxlen:15
    },
    address: {
      street: {
        type: String
      },
      city: {
        type: String
      },
      pincode: {
        type: String,
        match:[/^[1-9]\d{5}$/,"Please enter valid pincode"]
     }},
    
  },{ timestamps: true });


module.exports = mongoose.model("User", userSchema);