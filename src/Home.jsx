import { useState } from "react";

function Home({sendData}){
    const [inputName, setInputName] = useState('');
    const [name, setName] = useState('');
    const [remotePeerId, setRemotePeerId] = useState('');

    return (
        <div className="home">
            <h1>Chat Room</h1>
            <h2>Set your name</h2>
            <input
                type="text"
                placeholder="Enter your name"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
            />
            <button onClick={() => setName(inputName)}>Set</button>
            <br/>
            <button onClick={() => sendData({name: name, isAdmin: true, pos: 'lobby'})}>Make Room</button>
            <br/>
            <input
                type="text"
                placeholder="Enter remote id"
                value={remotePeerId}
                onChange={(e) => setRemotePeerId(e.target.value)}
            />
            <button onClick={() => sendData({name: name, isAdmin: false, pos: 'lobby', remotePeerId: remotePeerId})}>Join Room</button>
        </div>
    );
}

export default Home