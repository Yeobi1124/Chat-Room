import { useState, useEffect, useRef } from "react";
import Peer from "peerjs";

function Lobby({name, isAdmin, remotePeerId, sendData}){
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [peerId, setPeerId] = useState('');
    const peerIns = useRef(null);
    const [ready, setReady] = useState(false);

    const adminIns = useRef(null);
    
    const playersData = useRef([{conn: null, name: name, isAdmin: true}]);
    const [allReady, setAllReady] = useState(false);
  
    useEffect(() => {
        console.log({name: name, isAdmin: isAdmin, remotePeerId: remotePeerId});

        const peer = new Peer();
        peerIns.current = peer;

        peer.on('open', id => {
            setPeerId(id);
            console.log(`My peer id: ${peerId}`);
            connectPeer();
        })

        peer.on('connection', conn => {
            console.log(`player ${conn.label} connected`);

            playersData.current = [...playersData.current, {conn: conn, name: conn.label, isReady: false, isAdmin: false}];

            conn.on('open', () => {
                sendAll({type: 'playerData',data: playersData.current.map(e => ({...e, conn: null}))});
            });

            conn.on('data', data => {
                console.log('recevied data');
                console.log(data);

                switch(data.type){
                    case 'msg':
                        setMessages(prevMsgs => [...prevMsgs, data]);
                        sendAll(data);
                        break;
                    case 'ready':
                        playersData.current = playersData.current.map(e => ({...e, isReady: e.name===data.sender ? !e.isReady : e.isReady}));
                        sendAll({type: 'playerData',data: playersData.current.map(e => ({...e, conn: null}))});

                        console.log('Ready received');
                        
                        let temp = true;

                        for(const player of playersData.current){
                            if(!player.isAdmin && !player.isReady){
                                temp = false;
                                break;
                            }
                        }

                        setAllReady(temp);
                        break;
                }

                
            })
        })

        peer.on('disconnected', () => {console.log('peer disconnected with server');});
        peer.on('error', (e)=>{console.log(`peer error occurred ${e}`);});
        return () => {peer.disconnect();};
    }, []);

    useEffect(() => {
        isAdmin && sendAll({type: 'playerData',data: playersData.current.map(e => ({...e, conn: null}))});
        console.log('useEffect Act');
    }, [playersData.current]);
  
    const sendAll = (data) => {
        console.log('sendAll act');
        console.log(data);
        if(!isAdmin) return;
        for(const player of playersData.current){
            if(player.conn)
                player.conn.send(data);
        }
    }

    const connectPeer = () => {
        if(isAdmin)
            return;
        
        if(adminIns.current && adminIns.current.open===true)
            return;

        const conn = peerIns.current.connect(remotePeerId, {label:name});
        adminIns.current = conn;

        conn.on('open', () => {
            conn.send({type: "msg", sender: name, text: `${name}님 입장!`});

            conn.on('data', data => {
                console.log('received data');
                console.log(data);

                switch(data.type){
                    case 'msg':
                        setMessages(prevMsgs => [...prevMsgs, {sender: data.sender, text: data.text}]);
                        break;
                    case 'ready':
                        break;
                    case 'playerData':
                        playersData.current = data.data;
                        console.log('recevied playerData');
                        console.log(playersData.current);
                        break;
                }
                
            });
        })
        
    }

    const sendMsg = () => {
      if(!message.trim())
        return;
  
      console.log('send');
      if(isAdmin){
        setMessages(prevMsgs => [...prevMsgs, {sender: name, text: message}]);
        sendAll({type:'msg', sender: name, text:message});
      }
      else{
        adminIns.current.send({type:'msg', sender: name, text: message});
      }
      setMessage(() => '');
    }

    const sendReady = () => {
        setReady(!ready);

        if(isAdmin){
            sendAll({type:'ready', sender: name});
        }
        else{
            adminIns.current.send({type:'ready', sender: name});
        }
    }

    const gameStart = () => {
        if(!allReady)
            return;

        sendData({name: name, pos: "game", isAdmin: isAdmin});
    }
  
    return (
      <div className='app'>
        <h1>Chat Room</h1>
        <h2>Lobby</h2>
        {isAdmin ? <h2>Peer ID: {peerId}</h2> : null}
        <br/>
        <br/>
        <h2>참여 인원</h2>
        <div>
            {playersData.current ? playersData.current.map((e)=>{
                return <div>{e.name}{!e.isAdmin ? e.isReady ? ", Ready": ", Not Ready" : null}</div>
            }): null}
        </div>
        <br/>
        <br/>
        <h2>Messages</h2>
        <div>
          {messages.map((msg) => (
            <p>{msg.sender}: {msg.text}</p>
          ))}
        </div>
        <input
          type='text'
          placeholder='Enter message'
          value={message}
          onChange={e => (setMessage(() => e.target.value))}
        />
        <button onClick={sendMsg}>Send</button>
        {!adminIns.current || !adminIns.current.open ? <button onClick={connectPeer}>connect test</button> : null}
        {!isAdmin ? <button onClick={sendReady} style={{color: ready ? "Green" : "Red"}}>{ready ? "Ready" : "Not Ready"}</button> : null}
        {isAdmin ? <button onClick={gameStart} style={{color: allReady ? "Green" : "Red"}}>Game Start</button>: null}
      </div>
    )
}

export default Lobby;