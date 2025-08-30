// websocket-server/server.js
import { WebSocketServer } from "ws";
import os from "os";

const wss = new WebSocketServer({ port: 8000 });

// We'll use a Map to store clients, with a unique ID for each.
const clients = new Map();

// Get local IPv4 address
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

const localIp = getLocalIp();
console.log("✅ WebSocket signaling server is running on port 8000");
console.log(`🌐 Access it at: ws://${localIp}:8000`);

wss.on("connection", (ws) => {
  // Generate a unique ID for this client
  const id = Math.random().toString(36).substring(2, 9);
  const metadata = { id };
  clients.set(ws, metadata);
  console.log(`Client connected with ID: ${id}`);

  ws.on("message", (messageAsString) => {
    const message = JSON.parse(messageAsString);
    const metadata = clients.get(ws);

    // Find the recipient client socket
    let recipientWs = null;
    for (const [clientWs, clientMeta] of clients.entries()) {
      if (clientMeta.id === message.target) {
        recipientWs = clientWs;
        break;
      }
    }

    if (!recipientWs || recipientWs.readyState !== recipientWs.OPEN) {
      console.log(`Target client ${message.target} not found or not open.`);
      return;
    }

    // Attach the sender's ID to the message before forwarding
    message.sender = metadata.id;

    console.log(`Relaying message from ${metadata.id} to ${message.target}`);
    recipientWs.send(JSON.stringify(message));
  });

  ws.on("close", () => {
    const metadata = clients.get(ws);
    console.log(`Client disconnected: ${metadata.id}`);
    clients.delete(ws);
  });

  // Immediately after connection, send the new client its own ID
  // and the IDs of all other connected clients.
  const otherClientIds = [...clients.values()]
    .map((meta) => meta.id)
    .filter((clientId) => clientId !== id);
  const initialPayload = {
    type: "init",
    id: id,
    otherClientIds: otherClientIds,
  };
  ws.send(JSON.stringify(initialPayload));

  // Inform all other clients that a new peer has joined.
  const newPeerPayload = {
    type: "new-peer",
    id: id,
  };
  for (const [clientWs, clientMeta] of clients.entries()) {
    if (clientWs !== ws && clientWs.readyState === ws.OPEN) {
      clientWs.send(JSON.stringify(newPeerPayload));
    }
  }
});
