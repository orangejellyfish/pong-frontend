const MIN_RECONNECT_DELAY = 250; // Min time to wait between reconnect attempts
const RECONNECT_DECAY = 1.5; // Rate of increase of reconnect delay
const MAX_RECONNECT_ATTEMPTS = 10;
const CHECK_SOCKET_READY_INTERVAL = 10;

class Socket {
  _url = new URL('${env:WS_URL}');
  _socket = null;
  _handlers = [];
  _reconnectAttempts = 0;
  _reconnectTimeout = null;
  _finished = false;

  constructor(params = {}) {
    for (const [key, value] of Object.entries(params)) {
      if ((value ?? null) !== null) {
        this._url.searchParams.append(key, value);
      }
    }

    this._connect();
  }

  onMessage(fn) {
    this._handlers.push(fn);
  }

  async send(message) {
    while (this._socket?.readyState !== 1) {
      if (this._finished) {
        return;
      }

      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => {
        setTimeout(resolve, CHECK_SOCKET_READY_INTERVAL);
      });
    }

    this._socket.send(JSON.stringify(message));
  }

  // Close the underlying socket and remove all event listeners.
  close() {
    if (this._socket) {
      this._socket.onopen = null;
      this._socket.onclose = null;
      this._socket.onmessage = null;
      this._socket.close();
      this._socket = null;
    }

    this._handlers = {};
    this._reconnectAttempts = 0;
    this._reconnectTimeout = null;
    this._finished = true;
  }

  _connect = () => {
    this._socket = new WebSocket(this._url.href);
    this._socket.onopen = this._onSocketOpen;
    this._socket.onclose = this._onSocketClose;
    this._socket.onmessage = this._onSocketMessage;
  };

  _onSocketOpen = () => {
    clearTimeout(this._reconnectTimeout);
    this._reconnectAttempts = 0;
  };

  _onSocketClose = () => {
    if (this._reconnectAttempts === MAX_RECONNECT_ATTEMPTS) return;

    const delay = MIN_RECONNECT_DELAY * (RECONNECT_DECAY ** this._reconnectAttempts);

    this._reconnectTimeout = setTimeout(() => {
      this._reconnectAttempts++;
      this._connect();
    }, delay);
  };

  _onSocketMessage = ({ data }) => {
    let message;

    try {
      message = JSON.parse(data);
    } catch (err) {
      return;
    }

    for (const handler of this._handlers) {
      handler(message);
    }
  };
}

