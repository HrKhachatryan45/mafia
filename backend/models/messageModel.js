const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Player'
    },
    content:{
        type:String,
        required:true,
    }
})

module.exports = mongoose.model('Message', MessageSchema);