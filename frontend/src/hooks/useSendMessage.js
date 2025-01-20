import {useState} from "react";
import {useRoomContext} from "../context/useRoomContext";
import {toast} from "react-toastify";

const useSendMessage = () => {
    const [loading, setLoading] = useState(false);
    const {setRoom,room} = useRoomContext()

    const sendMessage = async (senderId,content,type) => {
        setLoading(true);
        try {
            const response = await fetch(`/room/sendMessage/${room.roomId}`,{
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body:JSON.stringify({senderId,content,type})
            })
            const json = await response.json();

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
    return {loading,sendMessage}
}
export default useSendMessage;