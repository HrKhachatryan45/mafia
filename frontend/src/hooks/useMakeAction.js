import {useState} from "react";
import {useRoomContext} from "../context/useRoomContext";

const useMakeAction = () => {
    const [loading, setLoading] = useState(false);
    const {room} = useRoomContext()
    const makeAction = async (turn) => {
        setLoading(true);
        try {
            const response = await fetch(`/room/roleAction/${room.roomId}`,{
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({turn})
            })
        }catch (e) {
            console.log(e);
        }finally {
            setLoading(false);
        }
    }
    return {loading,makeAction}
}
export default useMakeAction;