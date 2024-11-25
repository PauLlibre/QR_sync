'use client';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export default function DesktopPage() {
  const [sessionId, setSessionId] = useState('');
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    const generatedSessionId = `session-${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(generatedSessionId);

    const newSocket = io('http://localhost:3001');
    newSocket.emit('joinRoom', generatedSessionId);
    setSocket(newSocket);

    newSocket.on('activityUpdate', (data: any) => {
      alert(`New Activity: ${data}`);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>Scan this QR Code with your mobile device</h1>
      <QRCodeSVG value={sessionId} />
    </div>
  );
}
