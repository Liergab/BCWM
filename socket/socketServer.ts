import type { Server as HttpServer } from 'http'
import { Server } from 'socket.io'
import logger from '../config/logger'
import { SOCKET_EVENTS } from './events'

export const initSocketServer = (httpServer: HttpServer): Server => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  })

  io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
    logger.info(`Socket connected: ${socket.id}`)

    socket.on(SOCKET_EVENTS.PING, (payload?: unknown) => {
      socket.emit(SOCKET_EVENTS.PONG, {
        message: 'pong',
        timestamp: new Date().toISOString(),
        payload: payload ?? null,
      })
    })

    socket.on(SOCKET_EVENTS.JOIN_ROOM, (room: string) => {
      if (!room || !room.trim()) return
      socket.join(room)
      socket.emit(SOCKET_EVENTS.MESSAGE_RECEIVE, {
        message: `Joined room ${room}`,
        room,
      })
    })

    socket.on(
      SOCKET_EVENTS.MESSAGE_SEND,
      ({ room, message }: { room: string; message: string }) => {
        if (!room || !message) return
        io.to(room).emit(SOCKET_EVENTS.MESSAGE_RECEIVE, {
          senderId: socket.id,
          room,
          message,
          sentAt: new Date().toISOString(),
        })
      }
    )

    socket.on(SOCKET_EVENTS.LEAVE_ROOM, (room: string) => {
      if (!room || !room.trim()) return
      socket.leave(room)
    })

    socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
      logger.info(`Socket disconnected: ${socket.id} (${reason})`)
    })
  })

  return io
}
