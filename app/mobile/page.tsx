"use client";

import { useEffect, useRef, useState } from "react";

export default function MobilePage() {
  const [sessionId, setSessionId] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasScanned, setHasScanned] = useState<boolean>(false);
  const socketRef = useRef<any>(null);
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    const loadModulesAndStartScanner = async () => {
      try {
        // Dynamically import socket.io-client and html5-qrcode
        const socketIoModule = await import("socket.io-client");
        const io = socketIoModule.default;
        const Html5QrcodeModule = await import("html5-qrcode");
        const { Html5Qrcode } = Html5QrcodeModule;

        if (!Html5Qrcode) {
          console.error("Html5Qrcode is undefined");
          return;
        }

        // Initialize the QR code scanner
        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;

        const qrCodeSuccessCallback = (decodedText: string) => {
          console.log("Has scanned:", hasScanned);
          if (!hasScanned) {
            setHasScanned(true);

            // Stop the scanner immediately
            html5QrCode
              .stop()
              .then(() => {
                html5QrCode.clear();
              })
              .catch((err: any) => {
                console.error("Failed to stop scanner:", err);
              });

            setSessionId(decodedText);

            // Establish WebSocket connection
            console.log("Joining room:", decodedText);
            const newSocket = io("http://192.168.1.45:8080"); // Update with your backend URL
            newSocket.emit("joinRoom", decodedText);
            socketRef.current = newSocket;

            fetch("/api/link-session", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sessionId: decodedText }),
            })
              .then(() => {
                alert("Session linked!");
              })
              .catch((error) => {
                console.error("Error linking session:", error);
              });
          }
        };

        const config = { fps: 10, qrbox: 250 };

        html5QrCode.start(
            { facingMode: "environment" },
            config,
            qrCodeSuccessCallback,
            (errorMessage: string) => {
              // Optionally log the error message at a lower log level
              console.debug("QR Code scan error (expected when no QR code is in view):", errorMessage);
            }
          )
          .catch((err: any) => {
            console.error("Camera start error:", err);
            setErrorMessage(
              "Failed to access the camera. Please ensure camera permissions are granted and try again."
            );
          });
          
      } catch (err) {
        console.error("Error loading modules or starting scanner:", err);
        setErrorMessage(
          "Failed to load required modules. Please try again later."
        );
      }
    };

    loadModulesAndStartScanner();

    // Cleanup on component unmount
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current.clear();
          })
          .catch((err: any) => {
            console.error("Failed to stop scanner on unmount:", err);
          });
      }
      socketRef.current?.disconnect();
    };
  }, []);

  const selectActivity = (activity: string) => {
    console.log("Activity selected:", activity);
    if (socketRef.current && sessionId) {
      socketRef.current.emit("activitySelected", {
        room: sessionId,
        activity,
      });
    }
  };

  return (
    <div>
      {/* Display the QR code scanner if there's no session ID and no error */}
      {!sessionId && !errorMessage && (
        <div id="reader" style={{ width: "100%", height: "500px" }} />
      )}

      {/* Display an error message if there's an error */}
      {errorMessage && (
        <div>
          <h2>Error</h2>
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Display the activity buttons if a session ID is set */}
      {sessionId && (
        <div>
          <h2>Select an Activity</h2>
          <button onClick={() => selectActivity("Activity 1")}>
            Activity 1
          </button>
          <button onClick={() => selectActivity("Activity 2")}>
            Activity 2
          </button>
        </div>
      )}
    </div>
  );
}
