import {useState} from "react";
import {useRoomContext} from "../context/useRoomContext";
import {toast} from "react-toastify";
import {useAuthContext} from "../context/useAuthContext";

const useChangePhase = () => {
    const [loading, setLoading] = useState(false);
    const {setRoom} = useRoomContext()
    const {authUser} = useAuthContext()
    const {room} = useRoomContext();
    const changePhase = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/room/changePhase/${room.roomId}`,{
                method: "POST",
                headers: {'Content-Type': 'application/json'}
            })
            const json = await response.json();



            if(json.error){
                toast.error(json.error)
            }
            if(response.ok){
                setRoom(json.room)
                localStorage.setItem('room',JSON.stringify(json.room));
            }

        }catch (e) {
            console.log(e);
        }finally {
            setLoading(false);
        }
    }
    return {loading,changePhase}
}
export default useChangePhase;