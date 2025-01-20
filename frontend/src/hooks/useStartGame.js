import {useState} from "react";
import {useRoomContext} from "../context/useRoomContext";
import {toast} from "react-toastify";
import {useAuthContext} from "../context/useAuthContext";

const useStartGame = () => {
    const [loading, setLoading] = useState(false);
    const {setRoom} = useRoomContext()
    const {setAuthUser} = useAuthContext()
    const startGame = async (roomId) => {
        setLoading(true);
        try {
            const response = await fetch(`/room/startRoom/${roomId}`,{
                method: "POST",
                headers: {'Content-Type': 'application/json'}
            })
            const json = await response.json();


            if (response.ok){
                toast.success("Game successfully started!");
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
    return {loading,startGame}
}
export default useStartGame;