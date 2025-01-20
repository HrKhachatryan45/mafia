import {useState} from "react";
import {useRoomContext} from "../context/useRoomContext";
import {toast} from "react-toastify";
import {useAuthContext} from "../context/useAuthContext";

const useEliminateByVote = () => {
    const [loading, setLoading] = useState(false);
    const {setRoom,room} = useRoomContext()
    const eliminate = async (victimId) => {
        setLoading(true);
        try {
            const response = await fetch(`/room/eliminateByVote/${room.roomId}`,{
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({victimId})
            })
            const json = await response.json();

            if (!response.ok){
                toast.error(json.error)
            }

            if (response.ok){
                setRoom(json.room)
                localStorage.setItem('room',JSON.stringify(json.room));
            }
            console.log(json)
        }catch (e) {
            console.log(e);
        }finally {
            setLoading(false);
        }
    }
    return {loading,eliminate}
}
export default useEliminateByVote;