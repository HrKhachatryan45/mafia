import {createContext, useContext, useEffect, useState} from "react";
import {io} from  'socket.io-client'
import {useAuthContext} from "./useAuthContext";
import {toast} from "react-toastify";
import {useRoomContext} from "./useRoomContext";
export const SocketContext = createContext();

export const useSocketContext = () =>{
    return useContext(SocketContext);
}

export const SocketContextProvider = ({children}) => {
    const [socket,setSocket] = useState(null);
    const {authUser,setAuthUser} = useAuthContext()
    const {room,setRoom} = useRoomContext();
    useEffect(() => {
        if (authUser) {
            const socket = io('http://localhost:8080', {
                query: { userId: authUser._id },
            });

            console.log(socket,'hihhih')

            setSocket(socket);

            return () => {
                socket.disconnect();
                console.log('Socket disconnected');
            };
        }

    }, [authUser,setAuthUser]);

    useEffect(() => {
        if (socket) {
            socket.on("userJoined", (updatedRoom) => {
                setRoom(updatedRoom);
                localStorage.setItem('room',JSON.stringify(updatedRoom));
            });

            return () => {
                socket.off("userJoined");
            };
        }
    }, [socket, room]);




    return <SocketContext.Provider value={{socket,setSocket}}>{children}</SocketContext.Provider>
}
