// import { Schema } from 'mongoose';
// import mongoose = require('mongoose');
// import bcrypt = require('bcrypt');

// const userSchema: Schema = new Schema({
//     firstName:  String, // String is shorthand for {type: String}
//     lastName: String,
//     email: {
//         type: String, 
//         unique: true
//     },
//     password: {
//         type: String, 
//         required: true
//     },
//     phone: {
//         type: String, 
//         required: false},
//     contacts: {
//         type: [{ connecteds: Boolean, extraData: {firstName: String, lastName: String} }],
//         required: false
//     },
//     date: { 
//         type: Date, 
//         default: Date.now 
//     },
//     requestedBy: String
// });

// const User = mongoose.model('User', userSchema)

// async function create(data) {
//     try {
//         const hashedPass = await bcrypt.hash(data.password, 10);
//         const newUser = new User({
//             firstName: data.firstName,
//             lastName: data.lastName,
//             email: data.email,
//             password: hashedPass,
//             requestedBy: ''
//         });
    
//         newUser.save(function (err: any) {
//             if (err) {
//                 return err;
//             } else {
//                 return 'created';
//             } 
//         });
//     } catch (error) {
//         throw new Error(error);
//     }
// }

// export {
//     User,
//     create,
// } 