let ioInstance = null;

function initSocket(io) {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    socket.on('subscribe_incident', (incidentId) => {
      socket.join(`incident_${incidentId}`);
      console.log(`[Socket.IO] ${socket.id} subscribed to incident_${incidentId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });
}

function emitEvent(eventName, payload) {
  if (ioInstance) {
    ioInstance.emit(eventName, payload);
    if (payload && payload.incidentId) {
      ioInstance.to(`incident_${payload.incidentId}`).emit(eventName, payload);
    }
  }
}

module.exports = {
  initSocket,
  emitEvent,
  getIO: () => ioInstance
};
