'use client';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect } from 'react';
import io from 'socket.io-client';

export default function MobilePage() {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', { fps: 10, qrbox: 250 }, false);
    scanner.render(
      (decodedText: string) => {
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
  }, []);

  return <div id="reader" />;
}
