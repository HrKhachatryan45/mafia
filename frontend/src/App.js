import React, {useState} from 'react';
import {useRoomContext} from "./context/useRoomContext";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import Home from "./pages/Home";
import Demo from "./pages/Demo";
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
function App(props) {

    const {room} = useRoomContext();

    return (
        <BrowserRouter>
            <Routes>
                <Route element={!room?<Home/>:<Navigate to={'/demo'}/>} path={'/'}/>
                <Route element={room?<Demo/>:<Navigate to={'/'}/>} path={'/demo'}/>
            </Routes>
            <ToastContainer autoClose={1000} />
        </BrowserRouter>
    );
}

export default App;