import {useState} from "react";
import {useRoomContext} from "../context/useRoomContext";
import {toast} from "react-toastify";
import {useAuthContext} from "../context/useAuthContext";

const useJoinGame = () => {
    const [loading, setLoading] = useState(false);
    const {setRoom} = useRoomContext()
    const {setAuthUser} = useAuthContext()

    const joinGame = async (name,roomId) => {
        setLoading(true);
        try {
            const response = await fetch(`/room/joinRoom/${roomId}`,{
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({name})
            })
            const json = await response.json();



            if(json.error){
                toast.error(json.error)
            }
            if(response.ok){
                toast.success("Joined to game!");
                setRoom(json.room)
                setAuthUser(json.user)
                localStorage.setItem('room',JSON.stringify(json.room));
                localStorage.setItem('user',JSON.stringify(json.user));
            }

        }catch (e) {
            console.log(e);
        }finally {
            setLoading(false);
        }
    }
    return {loading,joinGame}
}
export default useJoinGame;