const Room = require("../models/roomModel");
const Player = require("../models/playerModel");
const Message = require('../models/messageModel');
const shortid = require("shortid");
const {io,getReceiverSocketId} = require("../socket/socket")

const createRoom = async (req, res) => {
    const {name} = req.body;
    console.log(name)
    if (!name) {
        return res.status(400).json({ error: 'Room name is required' });
    }

    try {
        let roomId;
        let check;
        do{
            roomId = shortid.generate();
            check = await Room.findOne({roomId});
        }while (check)

        const newRoom = await new Room({
            roomId,
            gameStarted: false,
        })
        const user = await Player.create({
            name,
            isAdmin: true,
        })
        newRoom.players.push(user._id)

        newRoom.save()
        res.status(200).json({room:newRoom,user});
    }catch(err) {
        console.log(err)
    }
}

const joinRoom = async (req, res) => {
    const {roomId} = req.params;
    const {name} = req.body;
    try {
        const  room = await Room.findOne({roomId}).populate('players')
        if(!room || room.gameStarted){
            return res.status(400).json({error: 'Room not found or Is Full'});
        }
        if (room.players.some((player) => player.name === name)){
            return res.status(400).json({error: 'Name already exists'});
        }
        const  user = await Player.create({
            name,
            isAdmin: false,
        })
        room.players.push(user._id)
        await room.save();
        const completeRoom = await room.populate([
            { path: 'players' },
            { path: 'sherifAction.guessedMafiaId' },
            { path: 'doctorAction.savedId' },
            { path: 'mafiaAction.victimId' },
            {path: 'roles.playerId'},
            { path: 'conversations'},
            {
                path: 'conversations',
                populate: { path: 'senderId' }
            },
            { path : 'mafiaConversations.participants'},
            { path : 'mafiaConversations.messages'},
            {
                path : 'mafiaConversations.messages',
                populate: {path: "senderId"}
            },
        ]);


        io.emit('userJoined',completeRoom)

        res.status(200).json({room:completeRoom,user});
    }catch(err) {
        console.log(err)
    }

}

const startGame = async (req, res) => {
    const {roomId} = req.params;
    try {
        const  room = await Room.findOne({roomId}).populate("players")
        if(!room){
            return res.status(400).json({error: 'Room not found'});
        }
        room.gameStarted = true;

        const totalPlayers = room.players.length - 1;// one admin
        console.log(totalPlayers,"tot")
        // Calculate how many "Mafia" based on the total number of players
        const numMafia = Math.max(1, Math.floor(totalPlayers / 4)); // At least 1 Mafia
        const numDoctor = 1; // Always 1 Doctor
        const numDetective = 1; // Always 1 Detective
        const numVillagers = totalPlayers - (numMafia + numDoctor + numDetective); // Remaining are Villagers

        // Create the roles array
        const roles = [
            ...Array(numMafia).fill("Mafia"),
            ...Array(numDoctor).fill("Doctor"),
            ...Array(numDetective).fill("Detective"),
            ...Array(numVillagers).fill("Villager"),
        ];

        // Shuffle roles
        const shuffledRoles = roles.sort(() => Math.random() - 0.5);

        const nonAdminPlayers = room.players.filter((player) => !player.isAdmin);



        const roleIcons = {
            Mafia: "https://cdn-icons-png.flaticon.com/512/8593/8593103.png",
            Doctor: "https://cdn3d.iconscout.com/3d/premium/thumb/doctor-3d-icon-download-in-png-blend-fbx-gltf-file-formats--man-professional-medical-avatar-professions-pack-avatars-icons-5250867.png?f=webp",
            Detective: "https://icons.iconarchive.com/icons/microsoft/fluentui-emoji-3d/512/Detective-3d-Default-icon.png",
            Villager: "https://cdn-icons-png.flaticon.com/512/9137/9137280.png", // Example icon for Villager
        };


        // Assign roles to players
        const rolesData = nonAdminPlayers.map((player, index) => ({
            playerId: player._id,
            role: shuffledRoles[index],
            icon:roleIcons[shuffledRoles[index]]
        }));
        rolesData.push({
            playerId:room.players.find(player => player.isAdmin)._id,
            role:"Admin",
            icon:"https://cdn-icons-png.flaticon.com/512/2397/2397707.png"
        })

        // Save roles to the room
        room.roles = rolesData;

        room.roles.filter(role => role.role === "Mafia").map((role) => {
            room.mafiaConversations.participants.push(role.playerId._id)
        })


        await room.save();
        const completeRoom = await room.populate([
            { path: 'players' },
            { path: 'sherifAction.guessedMafiaId' },
            { path: 'doctorAction.savedId' },
            { path: 'mafiaAction.victimId' },
            {path: 'roles.playerId'},
            { path: 'conversations'},
            {
                path: 'conversations',
                populate: { path: 'senderId' }
            },
            { path : 'mafiaConversations.participants'},
            { path : 'mafiaConversations.messages'},
            {
                path : 'mafiaConversations.messages',
                populate: {path: "senderId"}
            },
        ]);



        io.emit('userJoined',completeRoom)

        res.status(200).json({room:completeRoom});
    }catch(err) {
        console.log(err)
    }
}

const changePhase = async (req, res) => {
    const {roomId} = req.params;

    try {
        const  room = await Room.findOne({roomId}).populate("players")
        if(!room){
            return res.status(400).json({error: 'Room not found'});
        }

        room.gamePhase = room.gamePhase === "night" ? "day" : "night";
        if(room.conversations.length  > 0){
            room.conversations.map(async (message) => {
                await Message.findByIdAndDelete(message._id)
            })
        }
        room.conversations = [];
    await   room.save()
        const completeRoom = await room.populate([
            { path: 'players' },
            { path: 'sherifAction.guessedMafiaId' },
            { path: 'doctorAction.savedId' },
            { path: 'mafiaAction.victimId' },
            {path: 'roles.playerId'},
            { path: 'conversations'},
            {
                path: 'conversations',
                populate: { path: 'senderId' }
            },
            { path : 'mafiaConversations.participants'},
            { path : 'mafiaConversations.messages'},
            {
                path : 'mafiaConversations.messages',
                populate: {path: "senderId"}
            },
        ]);



        io.emit('userJoined',completeRoom)

        res.status(200).json({room:completeRoom});


    }catch(err) {
        console.log(err)
    }
}

const makeAction = async (req, res) => {
    const {roomId} = req.params;
    const {turn} = req.body;
    try {
        const  room = await Room.findOne({roomId}).populate("players")
        if(!room){
            return res.status(400).json({error: 'Room not found'});
        }


        let mafias = room.roles.filter(role => role.role === "Mafia")
        let doctor = room.roles.find(role => role.role === "Doctor")
        let detective = room.roles.find(role => role.role === "Detective")
        console.log(detective,"DETECT")
        if (turn === "mafia"){
            mafias.map(mafia => {
                const receiverSocketId = getReceiverSocketId(mafia.playerId);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("mafiaTurn");
                }
            })
            io.emit("mafiaTurnAll")
        } else if (turn === "doctor"){
            const receiverSocketId = getReceiverSocketId(doctor.playerId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("doctorTurn");
            }
            io.emit("doctorTurnAll")
        } else if (turn === "detective"){
            const receiverSocketId = getReceiverSocketId(detective.playerId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("detectiveTurn");
            }
            io.emit("detectiveTurnAll")
        }


    }catch(err) {
        console.log(err)
    }
}

const makeChoice = async (req, res) => {
    const { roomId } = req.params;
    const { by, targetId } = req.body;

    try {
        // Find the room and populate necessary fields
        const room = await Room.findOne({roomId}).populate("players").populate({
            path: "roles.playerId",
        });

        if (!room) {
            return res.status(400).json({error: "Room not found"});
        }

        // Validate the targetId
        console.log(targetId, "players")
        const targetPlayer = room.players.find((player) => targetId !== undefined && player._id.toString() === targetId.toString() && !player.isDead)
        ;
        if (!targetPlayer) {
            return res.status(400).json({ error: "Player not found or Is already dead " });
        }

        let admin = room.roles.find(role => role.role === "Admin")

        // Process the action based on the role
        switch (by) {
            case "mafia":
                if(targetId.toString() === room.roles.find((role) => role.role === "Mafia")?.playerId._id.toString()){
                    return res.status(400).json({ error: "Mafia can't kill himself" });
                }
                if (targetId.toString() === admin.playerId._id.toString() ){
                    return res.status(400).json({ error: "Admin is not player" });
                }
                room.mafiaAction.isDone = true;
                room.mafiaAction.victimId = targetId;
                io.emit('mafiaDone')
                break;
            case "doctor":
                if (targetId.toString() === admin.playerId._id.toString() ){
                    return res.status(400).json({ error: "Admin is not player" });
                }
                room.doctorAction.isDone = true;
                room.doctorAction.savedId = targetId;
                io.emit('doctorDone')
                break;
            case "detective":
                if (targetId.toString() === admin.playerId._id.toString() ){
                    return res.status(400).json({ error: "Admin is not player" });
                }
                if(targetId.toString() === room.roles.find((role) => role.role === "Detective")?.playerId._id.toString()){
                    return res.status(400).json({ error: "Detective can't choose himself" });
                }
                room.sherifAction.isDone = true;
                room.sherifAction.guessedMafiaId = targetId;
                io.emit('detectiveDone')
                break;
            default:
                return res.status(400).json({ error: "Invalid role action" });
        }

        // Save the updated room data
        await room.save();

        // Fetch updated room details after save
        const completeRoom = await room.populate([
            { path: 'players' },
            { path: 'sherifAction.guessedMafiaId' },
            { path: 'doctorAction.savedId' },
            { path: 'mafiaAction.victimId' },
            {path: 'roles.playerId'},
            { path: 'conversations'},
            {
                path: 'conversations',
                populate: { path: 'senderId' }
            },
            { path : 'mafiaConversations.participants'},
            { path : 'mafiaConversations.messages'},
            {
                path : 'mafiaConversations.messages',
                populate: {path: "senderId"}
            },
        ]);

        console.log(completeRoom.roles);  // Check what the `playerId` field contains
        const isDetectiveAlive = !completeRoom?.roles?.find((role) => role.role === "Detective")?.playerId?.isDead
        const isDoctorAlive = !completeRoom?.roles?.find((role) => role.role === "Doctor")?.playerId?.isDead
        console.log(isDetectiveAlive,'det')
        console.log(isDoctorAlive,'doc')

        if ((by === "detective" && isDetectiveAlive) ||
            (by === "doctor" && !isDetectiveAlive)
        || (by === "mafia" && !isDetectiveAlive && !isDoctorAlive)
        ){
            let detective = completeRoom.roles.find(role => role.role === "Detective");
            let mafias = completeRoom.roles.filter(role => role.role === "Mafia");
            let guessedMafiaId = completeRoom.sherifAction?.guessedMafiaId?._id;



            const detectiveSocketId =  !detective.isDead ?getReceiverSocketId(detective.playerId._id) : undefined;
            console.log("Finding socket ID for detective:", detective);
            if (detectiveSocketId) {
                io.to(detectiveSocketId).emit("detectiveResponse", {
                    msg:guessedMafiaId !== undefined && mafias.some((mafia) => guessedMafiaId.toString() === mafia.playerId._id.toString())
                        ? "You were right!"
                        : "You were wrong!",
                });
            }


            let victimId = completeRoom.mafiaAction?.victimId?._id;
            let savedId = !completeRoom?.roles?.find((role) => role.role === "Doctor")?.playerId?.isDead ? completeRoom.doctorAction?.savedId?._id:undefined;
            let doctor = completeRoom.roles.find(role => role.role === "Doctor");
            console.log(detective,"my name")



            const victim = await Player.findById(victimId);
            console.log(savedId,'saveId')
            if(savedId !== undefined && victimId.toString() === savedId.toString()){
                io.emit('result',{msg:"No one died 😇"});
            }else {
                if(!detective.playerId.isDead && victimId.toString() === detective.playerId._id.toString()){
                    io.emit('result',{msg:`Detective eliminated 🗡️`});
                }else if(!doctor.playerId.isDead && victimId.toString() === doctor.playerId._id.toString()){
                    io.emit('result',{msg:`Doctor eliminated 🗡️`});
                }else {
                    io.emit('result',{msg:`${completeRoom.mafiaAction.victimId.name} eliminated 🗡️`});
                }
                victim.isDead = true;
            }

            await victim.save();
            const victimSocketId = getReceiverSocketId(victimId)

            io.to(victimSocketId).emit('eliminated',victim)

            const completeRoom2 = await room.populate([
                { path: 'players' },
                { path: 'sherifAction.guessedMafiaId' },
                { path: 'doctorAction.savedId' },
                { path: 'mafiaAction.victimId' },
                {path: 'roles.playerId'},
                { path: 'conversations'},
                {
                    path: 'conversations',
                    populate: { path: 'senderId' }
                },
                { path : 'mafiaConversations.participants'},
                { path : 'mafiaConversations.messages'},
                {
                    path : 'mafiaConversations.messages',
                    populate: {path: "senderId"}
                },
            ]);


            if (completeRoom2.roles.filter(role => role.role === "Mafia").every(role => role.playerId.isDead)){
                completeRoom2.gameStatus = "mafiaLost"
            }else if(completeRoom2.roles.filter(role => role.role !== "Mafia" && role.role !== "Admin").every(role => role.playerId.isDead)){
                completeRoom2.gameStatus = "mafiaWon"
            }
    await room.save();
        }


        const completeRoom3 = await room.populate([
            { path: 'players' },
            { path: 'sherifAction.guessedMafiaId' },
            { path: 'doctorAction.savedId' },
            { path: 'mafiaAction.victimId' },
            {path: 'roles.playerId'},
            { path: 'conversations'},
            {
                path: 'conversations',
                populate: { path: 'senderId' }
            },
            { path : 'mafiaConversations.participants'},
            { path : 'mafiaConversations.messages'},
            {
                path : 'mafiaConversations.messages',
                populate: {path: "senderId"}
            },
        ]);


        // Emit updated room to all connected clients
        io.emit("userJoined", completeRoom3);

    } catch (err) {
        console.error("Error in makeChoice:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const sendMessage = async (req,res) => {
    const {roomId} = req.params;
    const {content,senderId,type} = req.body;
    try {
        const  room = await Room.findOne({roomId}).populate("players")
        if(!room){
            return res.status(400).json({error: 'Room not found'});
        }

    const newMessage = await Message.create({
        content,
        senderId
    })

        if(type === "global"){
            room.conversations.push(newMessage._id)
        }else if(type === "mafia"){
            room.mafiaConversations.messages.push(newMessage._id)
        }


   await room.save();

        const completeRoom = await room.populate([
            { path: 'players' },
            { path: 'sherifAction.guessedMafiaId' },
            { path: 'doctorAction.savedId' },
            { path: 'mafiaAction.victimId' },
            {path: 'roles.playerId'},
            { path: 'conversations'},
            {
                path: 'conversations',
                populate: { path: 'senderId' }
            },
            { path : 'mafiaConversations.participants'},
            { path : 'mafiaConversations.messages'},
            {
                path : 'mafiaConversations.messages',
                populate: {path: "senderId"}
            },
        ]);


        io.emit("userJoined", completeRoom);
        io.emit("message")

        return res.status(200).json({room:completeRoom})

    }catch(err) {
        console.log(err)
    }
}


const eliminateVotingResult = async (req,res) => {
    const {roomId} = req.params;
    const {victimId} = req.body;
    try {
        const  room = await Room.findOne({roomId}).populate("players")
        if(!room){
            return res.status(400).json({error: 'Room not found'});
        }


        const completeRoom = await room.populate([
            { path: 'players' },
            { path: 'sherifAction.guessedMafiaId' },
            { path: 'doctorAction.savedId' },
            { path: 'mafiaAction.victimId' },
            {path: 'roles.playerId'},
            { path: 'conversations'},
            {
                path: 'conversations',
                populate: { path: 'senderId' }
            },
            { path : 'mafiaConversations.participants'},
            { path : 'mafiaConversations.messages'},
            {
                path : 'mafiaConversations.messages',
                populate: {path: "senderId"}
            },
        ]);


        let detective = completeRoom.roles.find(role => role.role === "Detective");
        let doctor = completeRoom.roles.find(role => role.role === "Doctor");
        let mafias = completeRoom.roles.filter(role => role.role === "Mafia");
        let admin = completeRoom.roles.find(role => role.role === "Admin")
        console.log(admin,"ake")
        if (victimId === undefined || !victimId){
            return res.status(400).json({error: 'Victim not found'});
        }
        if (victimId.toString() === admin.playerId?._id?.toString()){
            return  res.status(400).json({error: 'You cant kill yourself'});
        }


        const victim = await Player.findById(victimId);

        if(!detective.playerId.isDead && victimId.toString() === detective.playerId._id.toString()){
            io.emit('result',{msg:`Detective eliminated 🗡️`});
        }else if(!doctor.playerId.isDead && victimId.toString() === doctor.playerId._id.toString()){
            io.emit('result',{msg:`Doctor eliminated 🗡️`});
        }else if ( mafias.some((mafia) =>  victimId.toString() === mafia.playerId._id.toString() )){
            io.emit('result',{msg:`Mafia eliminated 🗡️`});
        }
        else {
            io.emit('result',{msg:`${victim.name} eliminated 🗡️`});
        }
        victim.isDead = true;
        await victim.save();
        const victimSocketId = getReceiverSocketId(victimId)

        io.to(victimSocketId).emit('eliminated',victim)

        const completeRoom2 = await room.populate([
            { path: 'players' },
            { path: 'sherifAction.guessedMafiaId' },
            { path: 'doctorAction.savedId' },
            { path: 'mafiaAction.victimId' },
            {path: 'roles.playerId'},
            { path: 'conversations'},
            {
                path: 'conversations',
                populate: { path: 'senderId' }
            },
            { path : 'mafiaConversations.participants'},
            { path : 'mafiaConversations.messages'},
            {
                path : 'mafiaConversations.messages',
                populate: {path: "senderId"}
            },
        ]);

        if (completeRoom2.roles.filter(role => role.role === "Mafia").every(role => role.playerId?.isDead)) {
            completeRoom2.gameStatus = "mafiaLost";
        } else if (completeRoom2.roles.filter(role => role.role !== "Mafia" && role.role !== "Admin").every(role => role.playerId?.isDead)) {
            completeRoom2.gameStatus = "mafiaWon";
        }


        await room.save();

    io.emit("userJoined", completeRoom2);

        return res.status(200).json({room:completeRoom2})

    }catch(err) {
        console.log(err)
    }
}

const leaveRoom = async (req,res) => {
    const {roomId} = req.params;
    const {playerId} = req.body
    try{
        const  room = await Room.findOne({roomId}).populate("players")
        if(!room){
            return res.status(400).json({error: 'Room not found'});
        }


        const completeRoom = await room.populate([
            { path: 'players' },
            { path: 'sherifAction.guessedMafiaId' },
            { path: 'doctorAction.savedId' },
            { path: 'mafiaAction.victimId' },
            {path: 'roles.playerId'},
            { path: 'conversations'},
            {
                path: 'conversations',
                populate: { path: 'senderId' }
            },
            { path : 'mafiaConversations.participants'},
            { path : 'mafiaConversations.messages'},
            {
                path : 'mafiaConversations.messages',
                populate: {path: "senderId"}
            },
        ]);

        let admin = completeRoom.players.find((player) => player.isAdmin)

        console.log(admin,"admin")
        if (playerId.toString() !== admin?._id.toString()){
            return res.status(400).json({error: 'Only admin can delete room'});
        }
        for (const player of completeRoom.players){
            await Player.findByIdAndDelete(player._id)
        }
        for (const message of completeRoom.conversations){
            await Message.findByIdAndDelete(message._id)
        }
        for (const message of completeRoom.mafiaConversations.messages){
            await Message.findByIdAndDelete(message._id)
        }

         await Room.findByIdAndDelete(room._id)
        io.emit('deleteRoom')


        return res.status(200).json({msg:"Room successfully deleted"})

    }catch(err) {
        console.log(err)
    }
}

module.exports = {
    startGame,
    createRoom,
    joinRoom,
    changePhase,
    makeAction,
    makeChoice,
    sendMessage,
    eliminateVotingResult,
    leaveRoom
}