const express = require('express');
const {createRoom, joinRoom, startGame, changePhase, makeAction, makeChoice, sendMessage, eliminateVotingResult,
    leaveRoom
} = require("../controllers/roomController");
const router = express.Router();

router.post('/createRoom',createRoom)
router.post('/joinRoom/:roomId',joinRoom)
router.post('/startRoom/:roomId',startGame)
router.post('/changePhase/:roomId',changePhase)
router.post("/roleAction/:roomId",makeAction)
router.post("/makeChoice/:roomId",makeChoice)
router.post("/sendMessage/:roomId",sendMessage)
router.post("/eliminateByVote/:roomId",eliminateVotingResult)
router.delete("/leaveRoom/:roomId",leaveRoom)
module.exports = router;