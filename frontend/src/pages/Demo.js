import React, {useEffect, useRef, useState} from 'react';
import {useRoomContext} from "../context/useRoomContext";
import {useAuthContext} from "../context/useAuthContext";
import useStartGame from "../hooks/useStartGame";
import {useSocketContext} from "../context/useSocketContext";
import useChangePhase from "../hooks/useChangePhase";
import useMakeAction from "../hooks/useMakeAction";
import useMakeChoice from "../hooks/useMakeChoice";
import {IoSend} from "react-icons/io5";
import {ImExit} from "react-icons/im";
import useSendMessage from "../hooks/useSendMessage";
import useEliminateByVote from "../hooks/useEliminateByVote";
import useDeleteRoom from "../hooks/useDeleteRoom";

function Demo(props) {
    const {room} = useRoomContext();
    const {authUser} = useAuthContext();
    const {socket} = useSocketContext();
    const [queue,setQueue] = useState({
        mafia:false,
        doctor:false,
        detective:false
        });
    const {startGame,loading} = useStartGame();
    const handleStartGame =async () => {
        await startGame(room.roomId)
    }
    const {loading:loading2,changePhase} = useChangePhase()
    const handleChangePhase =async () => {
            await changePhase();
    }
    const {loading:loading3,makeAction} = useMakeAction()

    const handleWake =async (res) => {
            setQueue((prev) => ({
                ...prev,
                [res.turn]: true
            }))
        await makeAction(res.turn)
    }
    const [savedName,setSavedName] = useState("");
    const [victimName,setVictimName] = useState("");
    const [guessedName,setGuessedName] = useState("");
    const [messageAction,setMessageAction] = useState("")
    const [messageDone,setMessageDone] = useState("");
    const [mafiaIsAwake,setMafiaIsAwake] = useState(false)
    const [doctorIsAwake,setDoctorIsAwake] = useState(false)
    const [detectiveIsAwake,setDetectiveIsAwake] = useState(false)
    const {loading:loading4,makeChoice} = useMakeChoice()
    const handleChoice = async ({by,targetName}) => {
        const targetId = room.players.find((player) => player.name === targetName)?._id
        console.log(room.players,'rooms')
        console.log(targetId,'target')
        await makeChoice({targetId:targetId,by})
    }
    const [result,setResult] = useState("")
    const [detectiveResult,setDetectiveResult] = useState("")
    const {setAuthUser} = useAuthContext()
    const [changedMessage,setChangedMessage] = useState(false)
    const [message,setMessage] = useState("")
    const {sendMessage,laoding:loadingMessage} = useSendMessage();
    const [victimNameByVote,setVictimNameByVote] = useState("")
    const handleSendMessage = async (ev) => {
        ev.preventDefault();

        if(room.gamePhase === "night"){
            handleChangePhase()
        }
        await sendMessage(authUser._id,message,"global");
        setMessage("")
    }


    const [mafiaMessage,setMafiaMessage] = useState("")
    const handleSendMafiaMessage = async (ev) => {

        ev.preventDefault();
        if(room.gamePhase === "night"){
            handleChangePhase()
        }
        await sendMessage(authUser._id,mafiaMessage,"mafia");
        setMafiaMessage("")
    }

    const {loading:loadingVote,eliminate} = useEliminateByVote()
    const handleEliminate = async (ev) => {
        ev.preventDefault()
        let victimId = room.roles.find((role) => role?.playerId?.name === victimNameByVote)?.playerId?._id;
        await eliminate(victimId)
    }
    const [toNight,setToNight]=useState(false)

    const {setRoom} = useRoomContext()
    useEffect(() => {
        if(!socket) return;
        socket.on("mafiaTurnAll",() => {
            setMessageAction("Mafia wakes up")
            setMessageDone("")
        })
        socket.on("doctorTurnAll",() => {
            setMessageAction("Doctor wakes up")
            setMessageDone("")
        })
        socket.on("detectiveTurnAll",() => {
            setMessageAction("Detective wakes up")
            setMessageDone("")
        })

        socket.on("mafiaTurn",() => {
                setMafiaIsAwake(true)
                setDoctorIsAwake(false)
                setDetectiveIsAwake(false)
            setMessageDone("")
        })
        socket.on("doctorTurn",() => {
                setDoctorIsAwake(true)
                setMafiaIsAwake(false)
                setDetectiveIsAwake(false)
            setMessageDone("")
        })

        socket.on("detectiveTurn",() => {
                setDetectiveIsAwake(true)
                setDoctorIsAwake(false)
                setMafiaIsAwake(false)
            setMessageDone("")
        })
        socket.on('mafiaDone',()=>{
            setMessageDone('Mafia has done his choice !')
            setMessageAction("")
            setMafiaIsAwake(false)

            if(room?.roles?.find((role) => role.role === "Doctor")?.playerId?.isDead){
                setQueue((prev) => ({
                    ...prev,
                    doctor: true
                }))
            }
        })

        socket.on('doctorDone',()=>{
            setMessageDone('Doctor has done his choice !')
            setMessageAction("")
            setDoctorIsAwake(false)
        })

        socket.on('detectiveDone',()=>{
            setMessageDone('Detective has done his choice !')
            setMessageAction("")
            setDetectiveIsAwake(false)
        })

        socket.on("result",(obj) => {
                handleChangePhase();

                setResult(obj.msg)
            setMessageDone("")
            setQueue({
                mafia: false,
                doctor: false,
                detective: false
            })
            setToNight(true)
        })

        socket.on("detectiveResponse",(obj) => {
            setDetectiveResult(obj.msg)
        })


            socket.on("eliminated",(user) => {
                setAuthUser(user);
                setToNight(true)
            })
        socket.on("message",() => {
            setChangedMessage(!changedMessage)
        })

        socket.on("deleteRoom",() => {
            setRoom(null)
            setAuthUser(null)
            localStorage.removeItem('user')
            localStorage.removeItem('room');
        })

    },[socket])

    const lastMessageRef = useRef(null)

    useEffect(() => {
        setTimeout(()=>{
            if (lastMessageRef.current){
                lastMessageRef.current?.scrollIntoView({behavior:'smooth',block:'end'})
            }
        },100)
    }, [room?.conversations?.length,message,changedMessage]);

    const {deleteRoom,loading:loadingDelete} = useDeleteRoom();

    const handleLeaveRoom =async () => {
        await deleteRoom()
    }

    useEffect(() => {
        if (!socket) return;

         if ((room.gameStatus === "mafiaLost" || room.gameStatus === "mafiaWon") && room.gamePhase === "night" && toNight) {
             handleChangePhase()
         }

         setTimeout(() => {
            setToNight(false)
         },3000)
    }, [room.gameStatus,socket,toNight]);

    return (

        <div className={'w-full h-screen bg-[#F8F9FA]  flex items-center justify-center'} >
            {!room.gameStarted ? <section
                className={'xl:w-[35%] lg:w-[45%] md:w-[50%] sm:w-[55%] w-[85%] xl:h-[90%] lg:h-[80%] md:h-[70%] sm:h-[65%] h-[74%]  bg-[#EDF2F7] rounded-md shadow-md shadow-zinc-400 flex flex-col items-center justify-start'}>
                <h2 className={'text-black xl:text-lg lg:text-lg md:text-md sm:text-md text-md mt-5'}>{room.roomId}</h2>
                <div className={'flex items-center justify-center mt-2'}>
                    <button className={'felx items-center rounded-md justify-center bg-red-500 px-4 py-2'}>
                        <span className={'text-white xl:text-lg lg:text-lg md:text-md sm:text-md text-md mr-4'}>Players : {room?.players?.length} </span>
                        <span className={'loading loading-sm loading-spinner text-white '}></span>
                    </button>

                </div>
                <div className={'flex items-center justify-center mt-5'}>
                    <h2>{room?.players?.length >= 5 ? "Waiting for Admin to Start the Game" : "At least 5 players needed "}</h2>
                </div>
                {authUser.isAdmin  && <div className={'flex items-center justify-center mt-5'}>
                    <button
                            disabled={room?.players?.length < 5}
                            onClick={handleStartGame}
                            className={'btn bg-red-500 border-none text-white w-full '}>
                        {loading?<span className={'loading loading-spinner'}></span>:"Start Game"}
                    </button>
                </div>}
                    {authUser.isAdmin && (loadingDelete ?<span className={'loading loading-spinner text-red-500 text-3xl mt-20'}></span>:<ImExit className={'text-red-500 text-3xl cursor-pointer mt-20'} onClick={handleLeaveRoom} />)}

            </section>
            :
                (room.gameStatus === "playing" ? (<section
                    style={room.gamePhase === "night" ? {
                        backgroundImage: `url(images/dark.png)`,
                        backgroundSize: "100% 100%",
                        color: "white"
                    } : {color: "black"}}
                    className={'xl:w-[35%] pb-10 lg:w-[45%] md:w-[50%] sm:w-[55%] w-[85%] xl:h-[90%] lg:h-[80%] md:h-[70%] sm:h-[65%] h-[74%] overflow-y-auto  bg-[#EDF2F7] rounded-md  shadow-md shadow-zinc-400 flex flex-col items-center justify-start'}>
                    <div className={'w-full px-5 h-fit flex flex-col items-center justify-center'}>
                        <div
                            className={'w-full xl:h-[120px] lg:h-[120px] md:h-[100px] sm:h-[100px] h-[140px] pl-14  flex items-center justify-center overflow-x-auto mt-5'}>
                            {room.roles.map((role) => {
                                const isMafia = role.role === "Mafia";

                                // Check if the current user is a mafia
                                const isCurrentUserMafia = room.roles.some(
                                    (r) => r.playerId._id === authUser._id && r.role === "Mafia"
                                );
                                return (
                                    <div className={"w-fit flex flex-col relative items-center justify-center "}
                                         key={role.playerId._id}>
                                            {authUser.isAdmin && room.doctorAction.isDone && role.role === "Doctor" &&
                                                <h2 className={'   text-white  indicator-item badge badge-success z-50'}>
                                                    {room.doctorAction.savedId.name}
                                                </h2>
                                            }

                                                {authUser.isAdmin && room.mafiaAction.isDone && role.role === "Mafia" &&
                                                    <h2 className={'    text-white indicator-item border-2 border-red-500 badge  z-50 bg-red-500'}>
                                                        {room.mafiaAction.victimId.name}
                                                    </h2>
                                                }
                                        {(authUser.isAdmin && ( role.role === "Admin" || !room.mafiaAction.isDone || !room.doctorAction.isDone || !room.sherifAction.isDone  || role.role === "Villager")) &&
                                            <h2 className={' z-[-999] text-transparent border-none  text-white indicator-item badge  z-50 bg-transparent'}>
                                                "hello"
                                            </h2>
                                        }

                                            {authUser.isAdmin && room.sherifAction.isDone && role.role === "Detective" &&
                                                <h2 className={'  text-white indicator-item badge badge-warning z-50'}>
                                                    {room.sherifAction.guessedMafiaId.name}
                                                </h2>
                                            }
                                            {role.playerId.isDead && <img className={'xl:w-16 lg:w-16 md:w-14 sm:w-14 w-14 xl:h-16 lg:h-16 md:h-14 sm:h-14 h-14 absolute z-20'}
                                                                          src={"https://clipart-library.com/2023/yioLR9bBT.gif"}/>}
                                            <img className={'xl:w-16 lg:w-16 md:w-14 sm:w-14 w-14 xl:h-16 lg:h-16 md:h-14 sm:h-14 h-14 relative'}
                                                 src={authUser.isAdmin || role.role === "Admin" || (isMafia && isCurrentUserMafia) || role.playerId._id === authUser._id || role.playerId.isDead ? role.icon : "https://static.vecteezy.com/system/resources/thumbnails/028/087/760/small_2x/user-avatar-icon-doodle-style-png.png"}/>
                                        <h3 className={`${room.gamePhase === "night" ? "text-white" : "text-black"} text-md ${authUser._id.toString() === role.playerId._id.toString() ? '!text-red-500' : 'text-black'} xl:text-lg lg:text-lg md:text-md sm:text-md text-sm mx-2`}>{role.playerId.name}</h3>
                                    </div>
                                )
                            })}
                        </div>
                        {!authUser.isAdmin &&
                            <h2 className={`${room.gamePhase === "night" ? "text-white" : "text-black"}  xl:text-lg lg:text-lg md:text-md sm:text-md text-sm`}>Your Role
                                : {room.roles.map((role) => {
                                    if (role.playerId._id === authUser._id) {
                                        return role.role
                                    }
                                })}</h2>}
                        <section className={'flex flex-col items-center justify-center px-5'}>
                            {room.gamePhase === "night" && messageAction === "" && messageDone === "" &&
                                <p className={'mt-5  xl:text-lg lg:text-lg md:text-md sm:text-md text-sm'}>Everyone Sleeps</p>}
                            {messageAction !== "" && room.gamePhase === "night" &&
                                <p className={'mt-5  xl:text-lg lg:text-lg md:text-md sm:text-md text-sm'}>{messageAction}</p>}
                            {messageDone !== "" && <p className={'mt-5  xl:text-lg lg:text-lg md:text-md sm:text-md text-sm'}>{messageDone}</p>}

                            {room.gamePhase === "night" && authUser.isAdmin && (
                                <div className="w-full h-fit flex justify-between ">
                                    {/* Mafia Wake Up */}
                                    <button
                                        onClick={() => handleWake({turn: "mafia"})}
                                        className={`btn ${
                                            queue.mafia || room?.roles?.find((role) => role.role === "Mafia")?.playerId?.isDead
                                                ? "cursor-not-allowed opacity-50"
                                                : "bg-red-500 border-red-500"
                                        } border-2 text-white  xl:text-[12px] lg:text-[12px] md:text-md sm:text-[10px] text-[10px] mt-5 w-[30%]`}
                                        disabled={queue.mafia || room?.roles?.find((role) => role.role === "Mafia")?.playerId?.isDead}
                                    >
                                        Mafia Wake Up
                                    </button>

                                    {/* Doctor Wake Up */}
                                    <button
                                        onClick={() => handleWake({turn: "doctor"})}
                                        className={`btn ${
                                            !queue.mafia || queue.doctor || room?.roles?.find((role) => role.role === "Doctor")?.playerId?.isDead
                                                ? "cursor-not-allowed opacity-50"
                                                : "bg-blue-500 border-blue-500"
                                        } border-2  xl:text-[12px] lg:text-[12px] md:text-md sm:text-[10px] text-[10px] text-white mt-5 w-[30%]`}
                                        disabled={!queue.mafia || queue.doctor || room?.roles?.find((role) => role.role === "Doctor")?.playerId?.isDead}
                                    >
                                        Doctor Wake Up
                                    </button>

                                    {/* Detective Wake Up */}
                                    <button
                                        onClick={() => handleWake({turn: "detective"})}
                                        className={`btn ${
                                            !queue.mafia || !queue.doctor || queue.detective || room?.roles?.find((role) => role.role === "Detective")?.playerId?.isDead
                                                ? "cursor-not-allowed opacity-50"
                                                : "bg-yellow-500 border-yellow-500"
                                        } border-2 xl:text-[12px] lg:text-[12px] md:text-md sm:text-[10px] text-[10px]  text-white mt-5 w-[30%]`}
                                        disabled={
                                            !queue.mafia || !queue.doctor || queue.detective || room?.roles?.find((role) => role.role === "Detective")?.playerId?.isDead
                                        }
                                    >
                                        Detective Wake Up
                                    </button>
                                </div>

                            )}

                            {result !== "" && room.gamePhase === "day" && <p className={'mt-5  xl:text-lg lg:text-lg md:text-md sm:text-md text-sm '}>{result}</p>}
                            {detectiveResult !== "" && room.gamePhase === "day" &&
                                <p className={'mt-5  xl:text-lg lg:text-lg md:text-md sm:text-md text-sm'}>{detectiveResult}</p>}


                            {room.gamePhase === "night" && mafiaIsAwake && !room.mafiaConversations.participants.some((mafia) => mafia.isDead) && room.mafiaConversations.participants.some((mafia) => mafia._id.toString() === authUser._id.toString()) && room.mafiaConversations.participants.length > 1 &&
                                <section
                                    className={'w-[100%] mt-5 h-[300px] bg-amber-100 rounded-xl flex  flex-col items-center justify-center'}>
                                    <h2 className={'text-black text-lg'}>Mafia Chat</h2>
                                    <div
                                        className={'w-full h-[300px] flex flex-col items-center px-2 overflow-y-auto pt-10 pb-4  '}>
                                        {room.mafiaConversations.messages.length > 0 && room.mafiaConversations.messages.map((message, index) => {
                                            let image = room?.roles?.find((role) => role.role === "Mafia" && authUser._id.toString() === role?.playerId?._id?.toString())?.icon
                                            return (
                                                <div
                                                    ref={index === room.mafiaConversations.length - 1 ? lastMessageRef : null}
                                                    className={`w-full h-fit items-center  chat ${message.senderId._id.toString() === authUser._id.toString() ? 'chat-end ' : 'chat-start'}`}
                                                    key={index}>
                                                    <div className="chat-image avatar">
                                                        <div className="w-10 rounded-full">
                                                            <img src={image}/>
                                                        </div>
                                                    </div>
                                                    {/*<section className={'flex flex-col justify-start items-start'}>*/}
                                                    <div className={"chat-header text-black mb-1 "}>
                                                        {message.senderId.name}
                                                    </div>
                                                    <div
                                                        className={`chat-bubble text-white ${message.senderId._id.toString() === authUser._id.toString() ? 'bg-blue-400  ' : 'bg-red-500'}`}>
                                                        {message.content}
                                                    </div>
                                                    {/*</section>*/}
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {<form onSubmit={handleSendMafiaMessage}
                                           className={'w-full h-fit flex items-center justify-between '}>
                                        <input type={'text'}
                                               value={mafiaMessage}
                                               onChange={(ev) => setMafiaMessage(ev.target.value)}
                                               placeholder={"Discuss victim"}
                                               className={'w-[70%]  pl-4 text-grey  bg-transparent border-2 border-red-500 rounded-md  focus:outline-0 '}
                                        />
                                        <button
                                            className={'w-[30%] h-[50px] mt-0  btn bg-red-500 border-2 border-red-500 text-lg text-white '}>
                                            {!loadingMessage ? <IoSend/> :
                                                <span className={'loading loading-spinner'}></span>}
                                        </button>
                                    </form>
                                    }
                                </section>}
                            {mafiaIsAwake && !authUser.isDead && room.mafiaConversations.participants[0]._id.toString() === authUser._id.toString() &&
                                <form onSubmit={(ev) => {
                                    ev.preventDefault();
                                    handleChoice({by: "mafia", targetName: victimName})
                                }}>
                                    <input type={'text'}
                                           className={'w-full xl:h-[50px] lg:h-[48px] md:h-[45px] sm:h-[43px] h-[40px] xl:text-md lg:text-md md:text-sm sm:text-sm text-sm rounded-none bg-transparent border-b-2 border-b-gray-500 focus:outline-0 mt-5'}
                                           placeholder={"Victim Name"}
                                           value={victimName}
                                           onChange={(e) => setVictimName(e.target.value)}
                                    />
                                    <button className={'btn bg-red-500 border-none text-white w-full mt-5'}>
                                        {loading2 ?
                                            <span className={'loading loading-spinner'}></span> : "Approve choice"}
                                    </button>
                                </form>}

                            {doctorIsAwake && !authUser.isDead && <form onSubmit={(ev) => {
                                ev.preventDefault();
                                handleChoice({by: "doctor", targetName: savedName})
                            }}>
                                <input type={'text'}
                                       className={'w-full xl:h-[50px] lg:h-[48px] md:h-[45px] sm:h-[43px] h-[40px] xl:text-md lg:text-md md:text-sm sm:text-sm text-sm rounded-none bg-transparent border-b-2 border-b-gray-500 focus:outline-0 mt-5'}
                                       placeholder={"Saving  Name"}
                                       value={savedName}
                                       onChange={(e) => setSavedName(e.target.value)}
                                />
                                <button className={'btn bg-red-500 border-none text-white w-full mt-5'}>
                                    {loading2 ? <span className={'loading loading-spinner'}></span> : "Approve choice"}
                                </button>
                            </form>}

                            {detectiveIsAwake && !authUser.isDead && <form onSubmit={(ev) => {
                                ev.preventDefault();
                                handleChoice({by: "detective", targetName: guessedName})
                            }}>
                                <input type={'text'}
                                       className={'w-full xl:h-[50px] lg:h-[48px] md:h-[45px] sm:h-[43px]  h-[40px] xl:text-md lg:text-md md:text-sm sm:text-sm text-sm rounded-none bg-transparent border-b-2 border-b-gray-500 focus:outline-0 mt-5'}
                                       placeholder={"Mafia Name"}
                                       value={guessedName}
                                       onChange={(e) => setGuessedName(e.target.value)}
                                />
                                <button className={'btn bg-red-500 border-none text-white w-full mt-5'}>
                                    {loading2 ? <span className={'loading loading-spinner'}></span> : "Approve choice"}
                                </button>
                            </form>}


                            {room.gamePhase === "day" && <p className={'mt-5'}>Everyone Wakes Up</p>}
                            {authUser.isAdmin &&
                                <button className={'btn bg-red-500 border-red-500 border-2 text-white mt-5 w-[100%] '}
                                        onClick={handleChangePhase}>{loading2 ? <span
                                    className={'loading loading-spinner'}></span> : (room.gamePhase === "night" ? "Change to Day" : "Change to Night")}</button>}
                        </section>
                        {room.gamePhase === "day" && <section
                            className={'xl:w-[60%] lg:w-[60%] md:w-[70%] sm:w-[80%] w-[100%] mt-5 h-[300px] bg-amber-100 rounded-xl flex  flex-col items-center justify-center'}>
                            <h2 className={'text-black text-lg'}>Chat</h2>
                            <div className={'w-full h-[300px] flex flex-col items-center px-2 overflow-y-auto  '}>
                                {room.conversations.length > 0 && room.conversations.map((message, index) => {
                                    const role = room?.roles?.find(role => role?.playerId?._id.toString() === message?.senderId?._id.toString());
                                    const isMafia = role.role === "Mafia";

                                    // Check if the current user is a mafia
                                    const isCurrentUserMafia = room.roles.some(
                                        (r) => r.playerId._id === authUser._id && r.role === "Mafia"
                                    );

                                    return (
                                        <div
                                            ref={index === room.conversations.length - 1 ? lastMessageRef : null}
                                            className={`w-full h-fit items-center  chat ${message.senderId._id.toString() === authUser._id.toString() ? 'chat-end ' : 'chat-start'}`}
                                            key={index}>
                                            <div className="chat-image avatar">
                                                <div className="w-10 rounded-full">
                                                    <img
                                                        src={authUser.isAdmin || (isMafia && isCurrentUserMafia) || role.playerId._id === authUser._id || role.playerId.isDead || role.role === "Admin" ? role.icon : "https://static.vecteezy.com/system/resources/thumbnails/028/087/760/small_2x/user-avatar-icon-doodle-style-png.png"}/>
                                                </div>
                                            </div>
                                            {/*<section className={'flex flex-col justify-start items-start'}>*/}
                                            <div className={"chat-header text-black mb-1 "}>
                                                {message.senderId.name}
                                            </div>
                                            <div
                                                className={`chat-bubble text-white ${message.senderId._id.toString() === authUser._id.toString() ? 'bg-blue-400  ' : 'bg-red-500'}`}>
                                                {message.content}
                                            </div>
                                            {/*</section>*/}
                                        </div>
                                    )
                                })}
                            </div>

                            {!authUser.isDead ? <form onSubmit={handleSendMessage}
                                                      className={'w-full h-fit flex items-center justify-between '}>
                                    <input type={'text'}
                                           value={message}
                                           onChange={(ev) => setMessage(ev.target.value)}
                                           placeholder={"Discuss night"}
                                           className={'w-[70%] h-[50px] pl-4 text-grey  bg-transparent border-2 border-red-500 rounded-md  focus:outline-0 '}
                                    />
                                    <button
                                        className={'w-[30%] h-[50px] mt-0  btn bg-red-500 border-2 border-red-500 text-lg text-white '}>
                                        {!loadingMessage ? <IoSend/> : <span className={'loading loading-spinner'}></span>}
                                    </button>
                                </form> :
                                <div className={'w-full h-[50px]'}></div>
                            }
                        </section>}
                        {room.gamePhase === "day" && authUser.isAdmin && <form onSubmit={handleEliminate}>
                            <input type={'text'}
                                   className={'w-full xl:h-[50px] lg:h-[48px] md:h-[45px] sm:h-[43px] h-[40px] xl:text-md lg:text-md md:text-sm sm:text-sm text-sm rounded-none bg-transparent border-b-2 border-b-gray-500 focus:outline-0 mt-5'}
                                   placeholder={"Victim  Name of Voting"}
                                   value={victimNameByVote}
                                   onChange={(e) => setVictimNameByVote(e.target.value)}
                            />
                            <button className={'btn bg-red-500 border-none text-white w-full mt-5'}>
                                {loadingVote ? <span className={'loading loading-spinner'}></span> : "Approve choice"}
                            </button>
                        </form>}
                    </div>
                            {room.gamePhase === "night" && authUser.isAdmin && (loadingDelete ?<span className={'loading loading-spinner text-red-500 xl:text-3xl lg:text-3xl md:text-2xl sm:text-2xl text-2xl mt-20'}></span>:<ImExit className={'text-red-500 xl:text-3xl lg:text-3xl md:text-2xl sm:text-2xl text-2xl cursor-pointer xl:mt-20 lg:mt-20 md:mt-16 sm:mt-10 mt-5'} onClick={handleLeaveRoom} />)}

                </section>):
                <section className={'xl:w-[35%] lg:w-[45%] md:w-[50%] sm:w-[55%] w-[85%] xl:h-[90%] lg:h-[80%] md:h-[70%] sm:h-[65%] h-[74%] z-50 bg-red-500 rounded-md flex flex-col items-center justify-center'}>
                    <h2 className={'text-xl text-white font-customOne'}>{room.gameStatus === "mafiaLost" ? "Villagers Won !!":"Mafia Won !!"}</h2>
                    {
                        room.gameStatus === "mafiaLost" ?
                            <section className={'w-full flex items-center justify-center relative mt-16'}>
                                <img src={'https://cdn-icons-png.flaticon.com/512/9137/9137280.png'}
                                     className={'w-16 h-16'}/>
                                <img src={'https://cdn-icons-png.flaticon.com/512/9137/9137280.png'}
                                     className={'w-24 h-24 -mt-5'}/>

                                <img src={'https://cdn-icons-png.flaticon.com/512/9137/9137280.png'}
                                     className={'w-16 h-16'}/>
                            </section> :
                            <section className={'w-full flex items-center justify-center relative mt-16'}>
                                <img src={'https://cdn-icons-png.flaticon.com/512/8593/8593103.png'}
                                     className={'w-16 h-16'}/>
                                <img src={'https://cdn-icons-png.flaticon.com/512/8593/8593103.png'}
                                     className={'w-24 h-24 -mt-5'}/>

                                <img src={'https://cdn-icons-png.flaticon.com/512/8593/8593103.png'}
                                     className={'w-16 h-16'}/>
                            </section>
                    }
                    {authUser.isAdmin && (loadingDelete ?<span className={'loading loading-spinner text-white text-3xl mt-20'}></span>:<ImExit className={'text-white text-3xl cursor-pointer mt-20'} onClick={handleLeaveRoom} />)}
                </section>
                )
            }
        </div>

    );
}

export default Demo;