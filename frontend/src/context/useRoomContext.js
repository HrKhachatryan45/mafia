import {createContext, useContext, useEffect, useState} from "react";

export const RoomContext = createContext();

export const useRoomContext = () => {
    return useContext(RoomContext)
};

export  const RoomContextProvider = ({ children }) => {
    const [room,setRoom] = useState(JSON.parse(localStorage.getItem("room")) || null);

    useEffect(() => {
        console.log(room)
    },[room])

    return <RoomContext.Provider value={{room,setRoom}}>{children}</RoomContext.Provider>
}