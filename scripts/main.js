/**
 * Dragonbane Campaign Assistant
 * Session-end advancement workflow for Dragonbane
 */

import {
  MODULE_ID,
  MODULE_NAME,
  SETTINGS,
  SOCKET_EVENTS,
} from "./constants.js";
import { SessionAdvancementDialog } from "./session-advancement-dialog.js";
import { registerSettings } from "./settings.js";
import { Utils } from "./utils.js";

class DragonbaneCampaignAssistant {
  static socket = null;

  /**
   * Initialize the module
   */
  static initialize() {
    if (game.system.id !== "dragonbane") {
      console.error(`${MODULE_NAME} requires the Dragonbane system`);
      return;
    }

    // Register settings FIRST before trying to use them
    registerSettings();

    // Now we can safely use debugLog
    Utils.debugLog("Main", "Initializing");
  }

  /**
   * Called when game is ready
   */
  static onReady() {
    const enabled = Utils.getSetting(SETTINGS.ENABLED);

    if (!enabled) {
      Utils.debugLog("Main", "Module disabled via settings");
      return;
    }

    // Validate socketlib
    if (!game.modules.get("socketlib")?.active) {
      console.error(`${MODULE_NAME} requires socketlib module`);
      ui.notifications.error(
        Utils.localize("CAMPAIGN_ASSISTANT.errors.socketlibRequired")
      );
      return;
    }

    // Setup socket
    this.setupSocket();

    // Add actor sheet buttons if enabled
    const addButtons = Utils.getSetting(SETTINGS.ADD_ACTOR_BUTTONS);

    if (addButtons) {
      this.setupActorSheetButtons();
    }

    Utils.debugLog("Main", "Ready");
  }

  /**
   * Setup socketlib for cross-client communication
   */
  static setupSocket() {
    this.socket = socketlib.registerModule(MODULE_ID);

    // Store on game object for global access
    game.modules.get(MODULE_ID).socket = this.socket;

    this.socket.register(SOCKET_EVENTS.OPEN_SESSION_DIALOG, (actorId) => {
      const actor = game.actors.get(actorId);
      if (actor && actor.isOwner) {
        new SessionAdvancementDialog(actor).render(true);
      }
    });

    this.socket.register(
      SOCKET_EVENTS.RECORD_ADVANCEMENT,
      async (actorId, actorName, results) => {
        // Only GM processes this
        if (!game.user.isGM) return;

        await this._recordAdvancementToJournal(actorId, actorName, results);
      }
    );

    Utils.debugLog("Main", "Socket registered");
  }

  /**
   * Record advancement to journal (GM only)
   */
  static async _recordAdvancementToJournal(actorId, actorName, results) {
    // Find or create "Advancement History" folder
    let folder = game.folders.find(
      (f) => f.name === "Advancement History" && f.type === "JournalEntry"
    );

    if (!folder) {
      folder = await Folder.create({
        name: "Advancement History",
        type: "JournalEntry",
        parent: null,
      });
    }

    // Find existing journal or create new one
    let journal = game.journal.find(
      (j) => j.name === actorName && j.folder?.id === folder.id
    );

    if (!journal) {
      journal = await JournalEntry.create({
        name: actorName,
        folder: folder.id,
      });
    }

    // Format the session data
    const successCount = results.filter((r) => r.success).length;
    const heroicAbilitiesCount = results.filter((r) => r.reachedMaximum).length;
    const date = new Date().toLocaleDateString(game.i18n.lang, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const successList = results
      .filter((r) => r.success)
      .map((r) => {
        const maxLabel = r.reachedMaximum
          ? " <strong>(Max Level 18)</strong>"
          : "";
        return `<li>${r.skill} (${r.oldLevel} → ${r.newLevel})${maxLabel}</li>`;
      })
      .join("");

    const heroicAbilitiesLine =
      heroicAbilitiesCount > 0
        ? `<p><strong>Heroic Abilities gained: ${heroicAbilitiesCount}</strong></p>`
        : "";

    const newEntry = `
      <hr>
      <h2>${date}</h2>
      <p><strong>Advancement marks used: ${results.length}</strong></p>
      <p><strong>Skills advanced: ${successCount}</strong></p>
      ${heroicAbilitiesLine}
      ${
        successCount > 0
          ? `<ul>${successList}</ul>`
          : "<p><em>No skills advanced this session.</em></p>"
      }
    `;

    // Get existing pages
    const pages = journal.pages.contents;

    if (pages.length === 0) {
      // Create first page without showing name
      await journal.createEmbeddedDocuments("JournalEntryPage", [
        {
          name: "Log",
          type: "text",
          title: {
            show: false,
          },
          text: {
            content: newEntry,
            format: CONST.JOURNAL_ENTRY_PAGE_FORMATS.HTML,
          },
        },
      ]);
    } else {
      // Append to first page
      const page = pages[0];
      await page.update({
        "text.content": page.text.content + newEntry,
      });
    }
  }

  /**
   * Add buttons to character sheets
   */
  static setupActorSheetButtons() {
    // ApplicationV2 uses class-specific hooks: renderDoDCharacterSheet
    Hooks.on("renderDoDCharacterSheet", (sheet, html, data) => {
      const actor = sheet.actor;
      if (!actor) {
        return;
      }

      // Only add for player characters
      if (!Utils.isPlayerCharacter(actor)) {
        return;
      }

      // Wait for DOM to be fully rendered
      setTimeout(() => {
        // Get the app element (native DOM, not jQuery)
        const appElement =
          sheet.element instanceof jQuery ? sheet.element[0] : sheet.element;

        if (!appElement) {
          return;
        }

        // Find the header first
        const header = appElement.querySelector(".window-header");
        if (!header) {
          return;
        }

        // Check if button already exists (prevent duplicates on re-render)
        if (header.querySelector(".session-advancement-control")) {
          return;
        }

        // Find the close button using ApplicationV2 data-action attribute (like popout module)
        let closeButton = header.querySelector('[data-action="close"]');

        // Fallback: try finding by class
        if (!closeButton) {
          closeButton = header.querySelector(".header-button.close");
        }

        if (!closeButton) {
          return;
        }

        // Create our button using native DOM (matching popout module style exactly)
        const headerButton = document.createElement("button");
        headerButton.classList.add(
          "header-control",
          "icon",
          "session-advancement-control"
        );
        headerButton.type = "button";
        headerButton.innerHTML = '<i class="fas fa-circle-arrow-up"></i>';
        headerButton.setAttribute(
          "data-tooltip",
          Utils.localize("CAMPAIGN_ASSISTANT.buttons.sessionAdvancement")
        );
        headerButton.setAttribute(
          "aria-label",
          Utils.localize("CAMPAIGN_ASSISTANT.buttons.sessionAdvancement")
        );

        // Add click handler
        headerButton.addEventListener("click", (event) => {
          event.preventDefault();
          new SessionAdvancementDialog(actor).render(true);
        });

        // Insert BEFORE close button (exactly like popout module does)
        closeButton.parentNode.insertBefore(headerButton, closeButton);
      }, 100); // Wait for DOM to be fully rendered
    });
  }

  /**
   * Setup public API
   */
  static setupAPI() {
    window[MODULE_ID] = {
      api: {
        // Open session advancement dialog for an actor
        openSessionDialog: (actor) => {
          if (!actor) {
            throw new Error("Actor is required");
          }
          return new SessionAdvancementDialog(actor).render(true);
        },

        // Get session history
        getSessionHistory: (actor) => {
          return Utils.getSessionHistory(actor);
        },

        // Utils
        utils: Utils,
      },
    };

    Utils.debugLog("Main", "API exposed");
  }
}

/* ------------------------------------------ */
/*  Module Initialization                     */
/* ------------------------------------------ */

Hooks.once("init", () => {
  DragonbaneCampaignAssistant.initialize();
});

Hooks.once("ready", () => {
  DragonbaneCampaignAssistant.onReady();
  DragonbaneCampaignAssistant.setupAPI();
});
