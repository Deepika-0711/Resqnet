import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin.replace(/:\d+$/, ':5000');

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling']
});

export function subscribeToEvents(handlers = {}) {
  const events = [
    'incidentCreated',
    'incidentAnalyzed',
    'ambulanceAssigned',
    'hospitalSelected',
    'routeSelected',
    'hospitalAlerted',
    'incidentStatusChanged',
    'handoffUpdated',
    'dashboardUpdated'
  ];

  events.forEach((eventName) => {
    if (handlers[eventName]) {
      socket.on(eventName, handlers[eventName]);
    }
  });

  return () => {
    events.forEach((eventName) => {
      if (handlers[eventName]) {
        socket.off(eventName, handlers[eventName]);
      }
    });
  };
}

export default socket;
