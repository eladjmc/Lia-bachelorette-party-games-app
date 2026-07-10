export const SOCKET_EVENTS = {
  SESSION_JOIN_GUEST: "session:join_guest",
  SESSION_JOIN_HOST: "session:join_host",
  SESSION_RECONNECT: "session:reconnect",
  SESSION_LEAVE: "session:leave",
  SESSION_PEEK: "session:peek",
  SESSION_STATE: "session:state",
  SESSION_ERROR: "session:error",
  SESSION_PAUSED: "session:paused",
  SESSION_RESUMED: "session:resumed",

  HOST_START_GAME: "host:start_game",
  HOST_ADVANCE: "host:advance",
  HOST_END_GAME: "host:end_game",
  HOST_RESET_SESSION: "host:reset_session",

  SESSION_RESET: "session:reset",

  TRIVIA_SUBMIT_ANSWER: "trivia:submit_answer",
  TRIVIA_ANSWER_RECEIVED: "trivia:answer_received",
  TRIVIA_QUESTION_REVEALED: "trivia:question_revealed",

  GAME_STARTED: "game:started",
  GAME_COUNTDOWN: "game:countdown",
  GAME_TRANSITION: "game:transition",
  GAME_COMPLETED: "game:completed",
  GAME_ENDED: "game:ended",
} as const;
