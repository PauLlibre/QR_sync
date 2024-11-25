'use client';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

export default function MobilePage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', { fps: 10, qrbox: 250 }, false);
    scanner.render(
      (decodedText: string) => {
        setSessionId(decodedText);
        // Establish WebSocket connection
        const newSocket: Socket = io('http://localhost:3001');
        newSocket.emit('joinRoom', decodedText);
        setSocket(newSocket);

        fetch('/api/link-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: decodedText }),
        }).then(() => {
          alert('Session linked!');
          scanner.clear();
        });
      },
      (errorMessage: string) => {
        console.error(`QR Code scan error: ${errorMessage}`);
      }
    );

    // Clean up on unmount
    return () => {
      socket?.disconnect();
    };
  }, []);

  const selectActivity = (activity: string) => {
    if (socket && sessionId) {
      socket.emit('activitySelected', { room: sessionId, activity });
    }
  };

  return (
    <div>
      <div id="reader" />
      {sessionId && (
        <div>
          <h2>Select an Activity</h2>
          <button onClick={() => selectActivity('Activity 1')}>Activity 1</button>
          <button onClick={() => selectActivity('Activity 2')}>Activity 2</button>
        </div>
      )}
    </div>
  );
}
