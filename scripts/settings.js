/**
 * Settings for Dragonbane Campaign Assistant
 */

import { MODULE_ID, SETTINGS } from "./constants.js";

export function registerSettings() {
  // Master toggle
  game.settings.register(MODULE_ID, SETTINGS.ENABLED, {
    name: game.i18n.localize("CAMPAIGN_ASSISTANT.settings.enabled.name"),
    hint: game.i18n.localize("CAMPAIGN_ASSISTANT.settings.enabled.hint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });

  // Add buttons to character sheets
  game.settings.register(MODULE_ID, SETTINGS.ADD_ACTOR_BUTTONS, {
    name: game.i18n.localize(
      "CAMPAIGN_ASSISTANT.settings.addActorButtons.name",
    ),
    hint: game.i18n.localize(
      "CAMPAIGN_ASSISTANT.settings.addActorButtons.hint",
    ),
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: () => {
      // Re-render any open character sheets so the header control appears
      // or disappears immediately — no reload needed. The header-controls
      // hook in main.js re-reads this setting on each render.
      for (const app of foundry.applications.instances.values()) {
        // Only the Dragonbane character sheet — not every actor-associated
        // app (e.g. Visual Active Effects), which may have no "header" part.
        if (app.constructor?.name !== "DoDCharacterSheet") continue;

        // Guard that the sheet actually declares a "header" part before
        // requesting a partial re-render of it.
        if ("header" in (app.constructor.PARTS ?? {})) {
          app.render({ parts: ["header"] });
        } else {
          app.render();
        }
      }
    },
  });

  // Track session history
  game.settings.register(MODULE_ID, SETTINGS.TRACK_SESSION_HISTORY, {
    name: game.i18n.localize(
      "CAMPAIGN_ASSISTANT.settings.trackSessionHistory.name",
    ),
    hint: game.i18n.localize(
      "CAMPAIGN_ASSISTANT.settings.trackSessionHistory.hint",
    ),
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });

  // Use weakness optional rule
  game.settings.register(MODULE_ID, SETTINGS.USE_WEAKNESS_RULE, {
    name: game.i18n.localize(
      "CAMPAIGN_ASSISTANT.settings.useWeaknessRule.name",
    ),
    hint: game.i18n.localize(
      "CAMPAIGN_ASSISTANT.settings.useWeaknessRule.hint",
    ),
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  });

  // Hide individual default questions
  game.settings.register(MODULE_ID, SETTINGS.HIDE_PARTICIPATED, {
    name: game.i18n.localize(
      "CAMPAIGN_ASSISTANT.settings.hideParticipated.name",
    ),
    hint: game.i18n.localize(
      "CAMPAIGN_ASSISTANT.settings.hideParticipated.hint",
    ),
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register(MODULE_ID, SETTINGS.HIDE_EXPLORED, {
    name: game.i18n.localize("CAMPAIGN_ASSISTANT.settings.hideExplored.name"),
    hint: game.i18n.localize("CAMPAIGN_ASSISTANT.settings.hideExplored.hint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register(MODULE_ID, SETTINGS.HIDE_DEFEATED, {
    name: game.i18n.localize("CAMPAIGN_ASSISTANT.settings.hideDefeated.name"),
    hint: game.i18n.localize("CAMPAIGN_ASSISTANT.settings.hideDefeated.hint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register(MODULE_ID, SETTINGS.HIDE_OVERCAME, {
    name: game.i18n.localize("CAMPAIGN_ASSISTANT.settings.hideOvercame.name"),
    hint: game.i18n.localize("CAMPAIGN_ASSISTANT.settings.hideOvercame.hint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  });

  // Custom questions
  game.settings.register(MODULE_ID, SETTINGS.CUSTOM_QUESTIONS, {
    name: game.i18n.localize(
      "CAMPAIGN_ASSISTANT.settings.customQuestions.name",
    ),
    hint: game.i18n.localize(
      "CAMPAIGN_ASSISTANT.settings.customQuestions.hint",
    ),
    scope: "world",
    config: true,
    type: String,
    default: "",
  });

  // Advancement roll mode
  game.settings.register(MODULE_ID, SETTINGS.ADVANCEMENT_ROLL_MODE, {
    name: game.i18n.localize(
      "CAMPAIGN_ASSISTANT.settings.advancementRollMode.name",
    ),
    hint: game.i18n.localize(
      "CAMPAIGN_ASSISTANT.settings.advancementRollMode.hint",
    ),
    scope: "world",
    config: true,
    type: String,
    choices: {
      bulk: game.i18n.localize(
        "CAMPAIGN_ASSISTANT.settings.advancementRollMode.bulk",
      ),
      individual: game.i18n.localize(
        "CAMPAIGN_ASSISTANT.settings.advancementRollMode.individual",
      ),
    },
    default: "bulk",
  });

  // Debug mode
  game.settings.register(MODULE_ID, SETTINGS.DEBUG_MODE, {
    name: game.i18n.localize("CAMPAIGN_ASSISTANT.settings.debugMode.name"),
    hint: game.i18n.localize("CAMPAIGN_ASSISTANT.settings.debugMode.hint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  });
}
