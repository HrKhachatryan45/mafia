import React, {useState} from 'react';
import useCreateGame from "../hooks/useCreateGame";
import useJoinGame from "../hooks/useJoinGame";

function Home(props) {

    const {loading,createGame} = useCreateGame();
    const {loading:loading2,joinGame} = useJoinGame();
    const [adminName,setAdminName]=useState("");
    const [playerName,setPlayerName]=useState("");
    const [roomId,setRoomId]=useState("");
    const handleCreateRoom = async () => {
        await createGame(adminName);
    }
    const handleJoinGame = async () => {
        await joinGame(playerName, roomId);
    }

    return (
        <div className={'w-full h-screen bg-[#F8F9FA]  flex items-center justify-center '}>
            <section
                className={'xl:w-[35%] lg:w-[45%] md:w-[50%] sm:w-[55%] w-[85%] xl:h-[90%] lg:h-[80%] md:h-[70%] sm:h-[65%] h-[74%] bg-[#EDF2F7] rounded-md shadow-md shadow-zinc-400 flex flex-col items-center justify-start'}>
                <h2 className={'text-red-500 xl:text-3xl lg:text-2xl md:text-xl sm:text-md text-md  mb-2 mt-5 font-normal font-customOne  '}>Mafia</h2>
                <img className={' xl:w-28 lg:w-24 md:w-20 sm:w-16 w-14 xl:h-28 lg:h-24 md:h-20 sm:h-16 h-14'} src={'https://cdn-icons-png.flaticon.com/512/8593/8593103.png'}/>
                <div className={'w-[80%] h-fit xl:mt-16 lg:mt-14 md:mt-12 sm:mt-10 mt-8 '}>
                    <input type={'text'}
                           className={'w-full xl:h-[50px] lg:h-[48px] md:h-[45px] sm:h-[43px] h-[40px] xl:text-md lg:text-md md:text-sm sm:text-sm text-sm bg-transparent rounded-none border-b-2 border-b-gray-500 focus:outline-0'}
                           placeholder={"Player Name"}
                           value={adminName}
                           onChange={(e) => setAdminName(e.target.value)}
                    />
                    <button className={'btn bg-red-500 border-none text-white w-full xl:text-md lg:text-sm md:text-[12px] sm:text-[12px] text-[10px]  xl:mt-5 lg:mt-4 md:mt-3 sm:mt-3 mt-3'}
                            onClick={handleCreateRoom}>
                        {loading?<span className={'loading loading-spinner '}></span>:"Create New Game"}
                    </button>
                    <h4 className={'text-center xl:text-md lg:text-md md:text-sm sm:text-sm text-sm mt-5'}>Or</h4>
                    <input type={'text'}
                           className={'w-full xl:h-[50px] lg:h-[48px] md:h-[45px] sm:h-[43px] h-[40px] xl:text-md rounded-none lg:text-md md:text-sm sm:text-sm text-sm bg-transparent border-b-2 border-b-gray-500 focus:outline-0 '}
                           placeholder={"Player Name"}
                           value={playerName}
                           onChange={(e) => setPlayerName(e.target.value)}
                    />
                    <input type={'text'}
                           className={'w-full xl:h-[50px] lg:h-[48px] md:h-[45px] sm:h-[43px] h-[40px] xl:text-md rounded-none lg:text-md md:text-sm sm:text-sm text-sm bg-transparent border-b-2 border-b-gray-500 focus:outline-0 xl:mt-5 lg:mt-4 md:mt-3 sm:mt-3 mt-3'}
                           placeholder={"Game Id"}
                           value={roomId}
                           onChange={(e) => setRoomId(e.target.value)}
                    />
                    <button className={'btn bg-red-500 border-none text-white w-full xl:text-md lg:text-sm md:text-[12px] sm:text-[12px] text-[10px]  xl:mt-5 lg:mt-4 md:mt-3 sm:mt-3 mt-3'} onClick={handleJoinGame}>
                        {loading2?<span className={'loading loading-spinner'}></span>:"Join a Game"}
                    </button>
                </div>
            </section>
        </div>
    );
}

export default Home;