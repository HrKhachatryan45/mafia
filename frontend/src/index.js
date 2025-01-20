import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {RoomContextProvider} from "./context/useRoomContext";
import {AuthContextProvider} from "./context/useAuthContext";
import {SocketContext, SocketContextProvider} from "./context/useSocketContext";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <AuthContextProvider>
                <RoomContextProvider>
                    <SocketContextProvider>
                    <App />
                    </SocketContextProvider>
                </RoomContextProvider>
        </AuthContextProvider>
    </React.StrictMode>

);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
