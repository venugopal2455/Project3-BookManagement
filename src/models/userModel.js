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
    email:{type:String,required:true,match: /.+\@.+\..+/,unique:true},
    password:{type:String,required:true,unique:true,minlength:8,maxlength:20},
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