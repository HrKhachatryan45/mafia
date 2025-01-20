import {useState} from "react";
import {useRoomContext} from "../context/useRoomContext";
import {toast} from "react-toastify";
import * as json from "react-toastify";

const useMakeChoice = () => {
    const [loading, setLoading] = useState(false);
    const {room} = useRoomContext()
    const makeChoice = async ({by,targetId}) => {
        setLoading(true);
        try {
            const response = await fetch(`/room/makeChoice/${room.roomId}`,{
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({by,targetId})
            })
            const  json = await   response.json();
            if (!response.ok) {
                toast.error(json.error)
            }
        }catch (e) {
            console.log(e);
        }finally {
            setLoading(false);
        }
    }
    return {loading,makeChoice}
}
export default useMakeChoice;