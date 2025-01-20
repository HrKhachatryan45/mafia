import {useState} from "react";
import {useRoomContext} from "../context/useRoomContext";
import {toast} from "react-toastify";
import {useAuthContext} from "../context/useAuthContext";

const useCreateGame = () => {
    const [loading, setLoading] = useState(false);
    const {setRoom} = useRoomContext()
    const {setAuthUser} = useAuthContext()
    const createGame = async (name) => {
        setLoading(true);
        try {
            const response = await fetch('/room/createRoom',{
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({name})
            })
            const json = await response.json();


            if (response.ok){
                toast.success("Game successfully created!");
                setRoom(json.room)
                setAuthUser(json.user)
                localStorage.setItem('room',JSON.stringify(json.room));
                localStorage.setItem('user',JSON.stringify(json.user));
            }
            console.log(json)
        }catch (e) {
            console.log(e);
        }finally {
            setLoading(false);
        }
    }
    return {loading,createGame}
}
export default useCreateGame;