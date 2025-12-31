/**
 * Utility functions for Dragonbane Campaign Assistant
 */

import { FLAG_KEYS, MODULE_ID, SETTINGS } from "./constants.js";

export class Utils {
  /**
   * Get a module setting
   */
  static getSetting(key) {
    return game.settings.get(MODULE_ID, key);
  }

  /**
   * Debug log (only if debug mode enabled)
   */
  static debugLog(context, message, data = null) {
    // Be defensive - check if settings are registered yet
    let debugMode = false;
    try {
      debugMode = this.getSetting(SETTINGS.DEBUG_MODE);
    } catch (e) {
      // Settings not registered yet, skip debug logging
      return;
    }

    if (debugMode) {
      const prefix = `${MODULE_ID} | ${context}`;
      if (data) {
        console.log(`${prefix} | ${message}`, data);
      } else {
        console.log(`${prefix} | ${message}`);
      }
    }
  }

  /**
   * Localize a string
   */
  static localize(key) {
    return game.i18n.localize(key);
  }

  /**
   * Format localized string
   */
  static format(key, data) {
    return game.i18n.format(key, data);
  }

  /**
   * Check if actor is a player character
   */
  static isPlayerCharacter(actor) {
    return actor?.type === "character" && actor.hasPlayerOwner;
  }

  /**
   * Get all skills from actor
   */
  static getSkills(actor) {
    return actor.items.filter((item) => item.type === "skill");
  }

  /**
   * Get skills marked for advancement
   */
  static getMarkedSkills(actor) {
    return actor.items.filter(
      (item) => item.type === "skill" && !!item.system.advance // Truthy check
    );
  }

  /**
   * Get unmarked skills (available for marking)
   */
  static getUnmarkedSkills(actor) {
    return actor.items.filter(
      (item) =>
        item.type === "skill" &&
        !item.system.advance && // Treats false, null, undefined as unmarked
        item.system.value < 18 // Can't mark skills at max level
    );
  }

  /**
   * Get session history from actor
   */
  static getSessionHistory(actor) {
    return actor.getFlag(MODULE_ID, FLAG_KEYS.SESSION_HISTORY) || [];
  }

  /**
   * Save session history to actor
   */
  static async saveSessionHistory(actor, history) {
    await actor.setFlag(MODULE_ID, FLAG_KEYS.SESSION_HISTORY, history);
  }

  /**
   * Add session to history
   */
  static async addSessionToHistory(actor, sessionData) {
    const history = this.getSessionHistory(actor);
    const session = {
      ...sessionData,
      timestamp: Date.now(),
      sessionNumber: history.length + 1,
    };
    history.push(session);
    await this.saveSessionHistory(actor, history);
    return session;
  }
}
