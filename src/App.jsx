import { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';
import './App.css';
import Home from './Home';
import Lobby from './Lobby';

function App() {
  const [name, setName] = useState('');
  const [pos, setPos] = useState('home');
  const [remotePeerId, setRemotePeerId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const sendData = (data) => {
    setName(data.name);
    setPos(data.pos);
    setIsAdmin(data.isAdmin);
    if(!isAdmin)
      setRemotePeerId(data.remotePeerId);
  }

  return (
    <div className='app'>
      {pos==='home' ? <Home sendData={sendData}/> : null}
      {pos==='lobby' ? <Lobby name={name} isAdmin={isAdmin} remotePeerId={remotePeerId} sendData={sendData}/> : null}
      {pos==='game' ? <h1>Game Part</h1> : null}
    </div>
  )
}

export default App
