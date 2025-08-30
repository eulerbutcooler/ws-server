# WebSocket Signaling Server

A WebSocket-based signaling server that enables peer-to-peer communication by facilitating message relay between connected clients. This server acts as a central hub for WebRTC signaling or any real-time messaging application.

## Features

- 🔄 Real-time message relay between clients
- 🆔 Automatic unique ID assignment for each connected client
- 🌐 Network IP address detection for easy access across devices
- 📊 Client connection tracking and management
- 🔌 Automatic peer discovery and notification
- 📝 Comprehensive logging for debugging

## Dependencies

- **Node.js** (v14 or higher)
- **ws** (v8.18.3) - WebSocket library for Node.js

## Installation

1. Clone the repository:

```bash
git clone https://github.com/eulerbutcooler/ws-server.git
cd ws-server
```

2. Install dependencies:

```bash
npm install
```

## Usage

### Starting the Server

```bash
node server.js
```

The server will start on port 8000 and display:

- ✅ Confirmation that the server is running
- 🌐 WebSocket URL with your local IP address (e.g., `ws://192.168.1.100:8000`)

### Example Output

```
✅ WebSocket signaling server is running on port 8000
🌐 Access it at: ws://192.168.1.100:8000
```

## How It Works

### Client Connection Flow

1. **Connection**: When a client connects, the server:

   - Generates a unique 7-character ID
   - Stores the client in an internal Map
   - Sends an initialization message with the client's ID and list of other connected peers

2. **Message Relay**: Clients can send messages to specific targets:

   - Messages must include a `target` field with the recipient's ID
   - Server automatically adds the sender's ID before forwarding
   - Only relays to active, open connections

3. **Peer Notification**: When a new client joins:
   - All existing clients receive a "new-peer" notification
   - Enables automatic peer discovery

### Message Format

#### Client to Server (Outgoing)

```json
{
  "target": "abc1234",
  "type": "offer",
  "data": "your message content"
}
```

#### Server to Client (Incoming)

```json
{
  "sender": "xyz5678",
  "target": "abc1234",
  "type": "offer",
  "data": "your message content"
}
```

#### Initialization Message

```json
{
  "type": "init",
  "id": "abc1234",
  "otherClientIds": ["xyz5678", "def9012"]
}
```

#### New Peer Notification

```json
{
  "type": "new-peer",
  "id": "new1234"
}
```

## Use Cases

- **WebRTC Signaling**: Exchange offers, answers, and ICE candidates
- **Real-time Chat**: Message relay between multiple clients
- **Gaming**: Peer-to-peer game state synchronization
- **Collaboration Tools**: Real-time document editing coordination
- **IoT Communication**: Device-to-device messaging

## Configuration

The server currently runs on port 8000. To change the port, modify the `WebSocketServer` initialization in `server.js`:

```javascript
const wss = new WebSocketServer({ port: YOUR_PORT });
```

## Network Access

The server automatically detects your local IPv4 address, making it accessible to other devices on the same network. This is useful for:

- Testing with mobile devices
- Cross-device development
- Local network demonstrations

## Logging

The server provides detailed logging for:

- Client connections and disconnections
- Message relay operations
- Failed delivery attempts
- Server startup information

## Client Example

Here's a basic JavaScript client example:

```javascript
const ws = new WebSocket("ws://192.168.1.100:8000");

ws.onopen = () => {
  console.log("Connected to signaling server");
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);

  if (message.type === "init") {
    console.log("My ID:", message.id);
    console.log("Other clients:", message.otherClientIds);
  } else if (message.type === "new-peer") {
    console.log("New peer joined:", message.id);
  } else {
    console.log("Message from", message.sender, ":", message);
  }
};

// Send a message to another client
function sendMessage(targetId, messageData) {
  ws.send(
    JSON.stringify({
      target: targetId,
      type: "chat",
      data: messageData,
    })
  );
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

ISC License

## Author

eulerbutcooler
