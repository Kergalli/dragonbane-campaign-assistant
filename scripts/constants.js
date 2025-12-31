/**
 * Constants for Dragonbane Campaign Assistant
 */

export const MODULE_ID = 'dragonbane-campaign-assistant';
export const MODULE_NAME = 'Dragonbane Campaign Assistant';

/**
 * Settings keys
 */
export const SETTINGS = {
  ENABLED: 'enabled',
  ADD_ACTOR_BUTTONS: 'addActorButtons',
  TRACK_SESSION_HISTORY: 'trackSessionHistory',
  USE_WEAKNESS_RULE: 'useWeaknessRule',
  HIDE_PARTICIPATED: 'hideParticipated',
  HIDE_EXPLORED: 'hideExplored',
  HIDE_DEFEATED: 'hideDefeated',
  HIDE_OVERCAME: 'hideOvercame',
  CUSTOM_QUESTIONS: 'customQuestions',
  DEBUG_MODE: 'debugMode'
};

/**
 * The 5 advancement questions from the rulebook (p.29)
 */
export const ADVANCEMENT_QUESTIONS = [
  'participated',  // Did you participate in the game session?
  'explored',      // Did you explore a new location?
  'defeated',      // Did you defeat one or more dangerous adversaries?
  'overcame',      // Did you overcome an obstacle without using force?
  'weakness'       // Did you give in to your weakness? (optional rule)
];

/**
 * Socket events
 */
export const SOCKET_EVENTS = {
  OPEN_SESSION_DIALOG: 'openSessionDialog',
  RECORD_ADVANCEMENT: 'recordAdvancement'
};

/**
 * Flag keys for actor data storage
 */
export const FLAG_KEYS = {
  SESSION_HISTORY: 'sessionHistory'
};
