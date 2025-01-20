import {useState} from "react";
import {useRoomContext} from "../context/useRoomContext";
import {toast} from "react-toastify";
import {useAuthContext} from "../context/useAuthContext";
import {useSocketContext} from "../context/useSocketContext";

const useChangePhase = () => {
    const [loading, setLoading] = useState(false);
    const {setRoom} = useRoomContext()
    const {authUser,setAuthUser} = useAuthContext()
    const {room} = useRoomContext();
    const {setSocket} = useSocketContext()
    const deleteRoom = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/room/leaveRoom/${room.roomId}`,{
                method: "DELETE",
                headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({playerId:authUser._id}),
            })
            const json = await response.json();



            if(json.error){
                toast.error(json.error)
            }
            if(response.ok){
                setRoom(null)
                setAuthUser(null)
                setSocket(null)
                localStorage.removeItem('user')
                localStorage.removeItem('room');
                toast.success(json.msg)
            }

        }catch (e) {
            console.log(e);
        }finally {
            setLoading(false);
        }
    }
    return {loading,deleteRoom}
}
export default useChangePhase;