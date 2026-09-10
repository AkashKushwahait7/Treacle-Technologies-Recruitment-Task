import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.store = null;
    this.status = 'disconnected'; // 'connected' | 'disconnected' | 'reconnecting'
  }

  init(store) {
    this.store = store;
  }

  connect() {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;

    this.socket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 60000,
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    this.socket.on('connect', () => {
      this.status = 'connected';
      console.log(`[Socket.IO Client] Connected (${this.socket.id})`);
      if (this.store) {
        this.store.dispatch({
          type: 'dashboard/setSocketStatus',
          payload: 'connected',
        });
        this.store.dispatch({
          type: 'toast/addToast',
          payload: {
            type: 'success',
            title: 'Live Stream Connected',
            message: 'Real-time telemetry link established.',
          },
        });
      }
    });

    this.socket.on('disconnect', (reason) => {
      this.status = 'disconnected';
      console.warn(`[Socket.IO Client] Disconnected: ${reason}`);
      if (this.store) {
        this.store.dispatch({
          type: 'dashboard/setSocketStatus',
          payload: 'disconnected',
        });
      }
    });

    this.socket.on('reconnect_attempt', () => {
      this.status = 'reconnecting';
      if (this.store) {
        this.store.dispatch({
          type: 'dashboard/setSocketStatus',
          payload: 'reconnecting',
        });
      }
    });

    // Real-time telemetry ingestion
    this.socket.on('telemetry:update', (telemetry) => {
      if (this.store) {
        this.store.dispatch({
          type: 'dashboard/handleLiveTelemetry',
          payload: telemetry,
        });
        this.store.dispatch({
          type: 'vehicles/updateVehicleTelemetry',
          payload: telemetry,
        });
      }
    });

    // Real-time alert ingestion
    this.socket.on('alert:new', (alert) => {
      if (this.store) {
        this.store.dispatch({
          type: 'alerts/handleNewAlert',
          payload: alert,
        });
      }
    });

    // Real-time alert resolution
    this.socket.on('alert:resolved', (alert) => {
      if (this.store) {
        this.store.dispatch({
          type: 'alerts/handleResolvedAlert',
          payload: alert,
        });
      }
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.status = 'disconnected';
      if (this.store) {
        this.store.dispatch({
          type: 'dashboard/setSocketStatus',
          payload: 'disconnected',
        });
      }
    }
  }

  subscribeToVehicle(vehicleId) {
    if (this.socket && this.socket.connected && vehicleId) {
      this.socket.emit('subscribe:vehicle', vehicleId);
    }
  }

  unsubscribeFromVehicle(vehicleId) {
    if (this.socket && this.socket.connected && vehicleId) {
      this.socket.emit('unsubscribe:vehicle', vehicleId);
    }
  }
}

export const socketService = new SocketService();
export default socketService;
