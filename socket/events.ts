export const SOCKET_EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  JOIN_ROOM: 'room:join',
  LEAVE_ROOM: 'room:leave',
  PING: 'ping',
  PONG: 'pong',
  MESSAGE_SEND: 'message:send',
  MESSAGE_RECEIVE: 'message:receive',
} as const

export type SocketEventName = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS]
