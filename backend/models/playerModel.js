const mongoose = require('mongoose');
const Schema = mongoose.Schema

const playerSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    isAdmin:{
        type: Boolean,
        required: true
    },
    isDead:{
        type: Boolean,
        required:true,
        default: false
    }
})

module.exports = mongoose.model('Player', playerSchema);