const mongoose = require('mongoose');
const Schema = mongoose.Schema




const RoomSchema = new Schema({
    roomId:{
        type: String,
        required: true
    },
    players:[{
        type:mongoose.Schema.Types.ObjectId,
        required:false,
        ref:"Player"
    }],
    gameStarted:{
        type: Boolean,
        required: true
    },
    gamePhase:{
        type: String,
        required: false,
        default:"night"
    },
    roles:[{
        role:{
            type: String,
            required: false
        },
        playerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Player"
        },
        icon: { type: String ,required:false},
    }],
    mafiaAction:{
        isDone:{
            type: Boolean,
            required:true,
            default: false
        },
        victimId:{
            type: mongoose.Schema.Types.ObjectId,
            required:false,
            ref:"Player"
        }
    },
    doctorAction:{
        isDone:{
            type: Boolean,
            required:true,
            default: false
        },
        savedId:{
            type: mongoose.Schema.Types.ObjectId,
            required:false,
            ref:"Player"
        }
    },
    sherifAction:{
        isDone:{
            type: Boolean,
            required:true,
            default: false
        },
        guessedMafiaId:{
            type: mongoose.Schema.Types.ObjectId,
            required:false,
            ref:"Player"
        }
    },
    conversations:[{
        type : mongoose.Schema.Types.ObjectId,
        required:false,
        ref:'Message',
        default:[]
    }],
    mafiaConversations:{
        participants: [{
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: 'Player',
            default:[]
        }],
        messages: [{
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: 'Message',
            default:[]
        }],
    },
    gameStatus:{
        type: String,
        required:true,
        enum: ["playing", "mafiaWon", "mafiaLost"],
        default:"playing"
    }
},{timestamps: true});
module.exports = mongoose.model('Room', RoomSchema);