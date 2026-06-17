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
        Utils.localize("CAMPAIGN_ASSISTANT.errors.socketlibRequired"),
      );
      return;
    }

    // Setup socket
    this.setupSocket();

    // Register the header control hook once. It self-checks the
    // ADD_ACTOR_BUTTONS setting at render time, so toggling the
    // setting takes effect without a reload.
    this.setupActorSheetButtons();

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

    // ENHANCED: Now accepts full sessionData object instead of individual parameters
    this.socket.register(
      SOCKET_EVENTS.RECORD_ADVANCEMENT,
      async (sessionData) => {
        // Only GM processes this
        if (!game.user.isGM) return;

        await this._recordAdvancementToJournal(sessionData);
      },
    );

    Utils.debugLog("Main", "Socket registered");
  }

  /**
   * ENHANCED: Record advancement to journal (GM only) with rich context
   */
  static async _recordAdvancementToJournal(sessionData) {
    // Only GM processes this
    if (!game.user.isGM) return;

    const {
      actorId,
      actorName,
      timestamp,
      results,
      questions,
      customQuestions,
      weakness,
      marks,
      skillsMarkedThisSession,
    } = sessionData;

    // Find or create "Advancement History" folder
    const folderName = Utils.localize("CAMPAIGN_ASSISTANT.journal.folderName");
    let folder = game.folders.find(
      (f) => f.name === folderName && f.type === "JournalEntry",
    );

    if (!folder) {
      folder = await Folder.create({
        name: folderName,
        type: "JournalEntry",
        parent: null,
      });
    }

    // Find existing journal or create new one
    let journal = game.journal.find(
      (j) => j.name === actorName && j.folder?.id === folder.id,
    );

    if (!journal) {
      journal = await JournalEntry.create({
        name: actorName,
        folder: folder.id,
      });
    }

    // Format the date
    const date = new Date(timestamp);
    const formattedDate = date.toLocaleDateString(game.i18n.lang, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Calculate statistics
    const successCount = results.filter((r) => r.success).length;
    const heroicAbilitiesCount = results.filter((r) => r.reachedMaximum).length;

    // Build the journal entry
    let entryHTML = `<h1>${formattedDate}</h1>`;

    // === SECTION 1: ADVANCEMENT QUESTIONS ===
    const questionLabels = {
      participated: Utils.localize("CAMPAIGN_ASSISTANT.questions.participated"),
      explored: Utils.localize("CAMPAIGN_ASSISTANT.questions.explored"),
      defeated: Utils.localize("CAMPAIGN_ASSISTANT.questions.defeated"),
      overcame: Utils.localize("CAMPAIGN_ASSISTANT.questions.overcame"),
    };

    const questionsAnswered = [];
    for (const [key, label] of Object.entries(questionLabels)) {
      if (questions[key]) {
        questionsAnswered.push(`<li>${label}</li>`);
      }
    }

    // Add custom questions
    if (customQuestions && Object.keys(customQuestions).length > 0) {
      const customQuestionsText = Utils.getSetting("customQuestions") || "";
      const customQuestionsList = customQuestionsText
        .split(";")
        .map((q) => q.trim())
        .filter((q) => q.length > 0);

      for (const [key, answered] of Object.entries(customQuestions)) {
        if (answered) {
          // Extract numeric index from key like "custom_0", "custom_1"
          const numericIndex = parseInt(key.replace("custom_", ""));
          const questionText =
            customQuestionsList[numericIndex] ||
            `Custom Question ${numericIndex + 1}`;
          questionsAnswered.push(`<li>${questionText}</li>`);
        }
      }
    }

    if (questionsAnswered.length > 0) {
      entryHTML += `<blockquote class="info">`;
      entryHTML += `<h3>${Utils.localize("CAMPAIGN_ASSISTANT.journal.advancementQuestions")}</h3>`;
      entryHTML += `<ul>${questionsAnswered.join("")}</ul>`;
      entryHTML += `</blockquote>`;
    }

    // === SECTION 2: WEAKNESS ===
    if (questions.weakness && questions.weakness !== "none" && weakness?.text) {
      // Strip HTML tags from weakness text
      const cleanWeakness = weakness.text.replace(/<[^>]*>/g, "").trim();

      let weaknessItems = `<li><strong>${Utils.localize("CAMPAIGN_ASSISTANT.journal.currentWeakness")}</strong> ${cleanWeakness}</li>`;

      if (questions.weakness === "gavein") {
        weaknessItems += `<li><strong>${Utils.localize("CAMPAIGN_ASSISTANT.journal.gaveInToWeakness")}</strong> ${Utils.localize("CAMPAIGN_ASSISTANT.journal.gaveInDescription")}</li>`;
      } else if (questions.weakness === "overcame") {
        weaknessItems += `<li><strong>${Utils.localize("CAMPAIGN_ASSISTANT.journal.overcameWeakness")}</strong> ${Utils.localize("CAMPAIGN_ASSISTANT.journal.overcameDescription")}</li>`;
      }

      entryHTML += `<blockquote class="info">`;
      entryHTML += `<h3>${Utils.localize("CAMPAIGN_ASSISTANT.journal.weakness")}</h3>`;
      entryHTML += `<ul>${weaknessItems}</ul>`;
      entryHTML += `</blockquote>`;
    }

    // === SECTION 3: ADVANCEMENT MARKS ===
    entryHTML += `<blockquote class="info">`;
    entryHTML += `<h3>${Utils.localize("CAMPAIGN_ASSISTANT.journal.advancementMarks")}</h3>`;
    entryHTML += `<ul>`;
    entryHTML += `<li><strong>${Utils.localize("CAMPAIGN_ASSISTANT.journal.totalMarks")}</strong> ${marks.total}</li>`;
    entryHTML += `<li><strong>${Utils.localize("CAMPAIGN_ASSISTANT.journal.fromQuestions")}</strong> ${marks.fromQuestions}</li>`;
    entryHTML += `<li><strong>${Utils.localize("CAMPAIGN_ASSISTANT.journal.fromAutoMarks")}</strong> ${marks.fromAutoMarks}</li>`;
    entryHTML += `</ul>`;
    entryHTML += `</blockquote>`;

    // === SECTION 4: RESULTS ===
    entryHTML += `<blockquote class="info">`;
    entryHTML += `<h3>${Utils.localize("CAMPAIGN_ASSISTANT.journal.results")}</h3>`;
    entryHTML += `<p><strong>${Utils.localize("CAMPAIGN_ASSISTANT.journal.skillsAdvanced")}</strong> ${successCount} ${Utils.localize("CAMPAIGN_ASSISTANT.journal.of")} ${results.length}</p>`;

    // Skills that advanced
    if (successCount > 0) {
      entryHTML += `<ul>`;
      for (const r of results.filter((r) => r.success)) {
        const maxLabel = r.reachedMaximum
          ? ` <strong>${Utils.localize("CAMPAIGN_ASSISTANT.journal.maxLevelHeroic")}</strong>`
          : "";
        entryHTML += `<li><strong>${r.skill}</strong>: ${r.oldLevel} → <strong>${r.newLevel}</strong>${maxLabel}</li>`;
      }
      entryHTML += `</ul>`;
    }

    // Skills that did not advance
    const failedResults = results.filter((r) => !r.success);
    if (failedResults.length > 0) {
      entryHTML += `<p><strong>${Utils.localize("CAMPAIGN_ASSISTANT.journal.skillsNotAdvanced")}</strong></p>`;
      entryHTML += `<ul>`;
      for (const r of failedResults) {
        entryHTML += `<li><strong>${r.skill}</strong>: ${Utils.localize("CAMPAIGN_ASSISTANT.journal.remainedAt")} ${r.oldLevel}</li>`;
      }
      entryHTML += `    </ul>`;
    }

    // Heroic abilities summary
    if (heroicAbilitiesCount > 0) {
      const heroicLabel =
        heroicAbilitiesCount === 1
          ? Utils.localize("CAMPAIGN_ASSISTANT.journal.heroicAbilityGained")
          : Utils.format("CAMPAIGN_ASSISTANT.journal.heroicAbilitiesGained", {
              count: heroicAbilitiesCount,
            });
      entryHTML += `<p><strong>${heroicLabel}</strong> ${Utils.localize("CAMPAIGN_ASSISTANT.journal.heroicDescription")}</p>`;
    }

    entryHTML += `</blockquote>`;

    // Update or create the journal page
    const pages = journal.pages.contents;
    if (pages.length > 0) {
      // Prepend to existing page (newest first)
      const existingPage = pages[0];
      await existingPage.update({
        text: {
          content: entryHTML + existingPage.text.content,
        },
      });
    } else {
      // Create new page with title display turned off
      await JournalEntryPage.create(
        {
          name: "Advancement History",
          type: "text",
          title: {
            show: false,
          },
          text: {
            content: entryHTML,
          },
        },
        { parent: journal },
      );
    }

    Utils.debugLog(
      "Journal",
      `Recorded advancement for ${actorName} on ${formattedDate}`,
    );
  }

  /**
   * Add buttons to character sheets
   */
  static setupActorSheetButtons() {
    // ApplicationV2 header-controls API. The system's character sheet
    // (DoDCharacterSheet) exposes the per-class hook
    // "getHeaderControlsDoDCharacterSheet". Returning a control entry here
    // lets Foundry render and position the button natively — which means it
    // travels correctly with pop-out windows and needs no DOM surgery.
    Hooks.on("getHeaderControlsDoDCharacterSheet", (sheet, controls) => {
      const actor = sheet.actor;
      if (!actor) return;

      // Respect the live setting (no reload needed — see settings.js onChange).
      if (!Utils.getSetting(SETTINGS.ADD_ACTOR_BUTTONS)) return;

      // Only player characters.
      if (!Utils.isPlayerCharacter(actor)) return;

      controls.push({
        icon: "fas fa-circle-arrow-up",
        label: "CAMPAIGN_ASSISTANT.buttons.sessionAdvancement",
        action: "openSessionAdvancement",
        // Visible in the always-shown header bar rather than the overflow menu.
        onClick: () => new SessionAdvancementDialog(actor).render(true),
      });
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
