'use client';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

export default function DesktopPage() {
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    const generatedSessionId = `session-${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(generatedSessionId);

    const newSocket: Socket = io('http://localhost:8080');
    console.log(generatedSessionId, newSocket);
    newSocket.emit('joinRoom', generatedSessionId);

    console.log(888888888888888888888888888888888888)
    newSocket.on('activityUpdate', (data: string) => {
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
