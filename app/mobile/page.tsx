'use client';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';

export default function MobilePage() {
  const [sessionId, setSessionId] = useState<string>('');
  const socketRef = useRef<Socket | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Check for camera API support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Camera API not supported in this browser.');
      return;
    }

    // Initialize the scanner
    const scanner = new Html5QrcodeScanner('reader', { fps: 10, qrbox: 250 }, /* verbose= */ true);
    scannerRef.current = scanner;

    scanner.render(
      (decodedText: string) => {
        console.log('QR Code decoded:', decodedText);
        setSessionId(decodedText);

        // Establish WebSocket connection
        const newSocket: Socket = io('https://YOUR_NGROK_URL:3001'); // Use HTTPS and your ngrok URL
        newSocket.emit('joinRoom', decodedText);
        socketRef.current = newSocket;

        fetch('/api/link-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: decodedText }),
        })
          .then(() => {
            alert('Session linked!');
            scanner.clear();
          })
          .catch((error) => {
            console.error('Error linking session:', error);
          });
      },
      (errorMessage: string) => {
        console.error(`QR Code scan error: ${errorMessage}`);
      }
    );

    // Cleanup on unmount
    return () => {
      scannerRef.current?.clear();
      socketRef.current?.disconnect();
    };
  }, []);

  const selectActivity = (activity: string) => {
    if (socketRef.current && sessionId) {
      socketRef.current.emit('activitySelected', { room: sessionId, activity });
    }
  };

  return (
    <div>
      <div id="reader" style={{ width: '100%', height: '500px' }} />
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
