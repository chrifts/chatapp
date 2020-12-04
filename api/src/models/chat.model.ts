import mongoose = require("mongoose");

//define schema
const chatRoomSchema = new mongoose.Schema({
    members: Array, //user _id
    messages:[
        {
            from: String, 
            to: String, 
            message: String, 
            timestamp: Number
        }
    ]
});

//define schema level methods to create access token and refresh token:
chatRoomSchema.methods = {

};

//pre save hook to hash password before saving user into the database:
// chatRoomSchema.pre("save", async function (next) {
//   //code...
//   return next();
// });

module.exports = mongoose.model("ChatRoom", chatRoomSchema);