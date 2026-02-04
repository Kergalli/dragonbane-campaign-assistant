/**
 * Session Advancement Dialog
 * Handles the 5 advancement questions and skill marking workflow
 * Supports two modes: Bulk (roll all at once) and Individual (click each skill)
 */

import { MODULE_ID, SETTINGS, SOCKET_EVENTS } from "./constants.js";
import { Utils } from "./utils.js";

const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

export class SessionAdvancementDialog extends HandlebarsApplicationMixin(
  ApplicationV2
) {
  constructor(actor, options = {}) {
    super(options);
    this.actor = actor;

    // Set dynamic title with character name
    this.options.window.title = `Session Advancement: ${actor.name}`;

    this.questionAnswers = {
      participated: false,
      explored: false,
      defeated: false,
      overcame: false,
      weakness: "none", // 'none', 'gavein', or 'overcame'
    };
    this.customQuestionAnswers = {}; // Track custom question answers separately
    this.additionalMarks = 0;
    this.selectedSkills = new Set();
    this.currentStep = 1; // Track which step we're on (1, 2, or 3)

    // Track which skills were already marked when dialog opened
    this.originalMarkedSkills = new Set(
      Utils.getMarkedSkills(this.actor).map((s) => s.id)
    );

    // Individual mode state
    this.rolledSkills = new Set(); // Track which skills have been rolled
    this.rollResults = []; // Store roll results for journal/summary
    this.skillsToRoll = new Set(); // Track which skills need rolling (set at start of Step 3)

    // ENHANCED: Capture weakness at dialog open for tracking changes
    this.weaknessAtStart = this.actor.system?.weakness || "";
  }

  static DEFAULT_OPTIONS = {
    id: "session-advancement-dialog",
    tag: "form",
    window: {
      title: "Session Advancement",
      contentClasses: [
        "dragonbane",
        "campaign-assistant",
        "session-advancement",
      ],
      resizable: true,
    },
    position: {
      width: 700,
      height: 755,
    },
    form: {
      handler: SessionAdvancementDialog.prototype._onFormSubmit,
      submitOnChange: true,
      closeOnSubmit: false,
    },
    actions: {
      markSkill: SessionAdvancementDialog.prototype._onMarkSkill,
      rollSingleSkill: SessionAdvancementDialog.prototype._onRollSingleSkill,
      rollAdvancement: SessionAdvancementDialog.prototype._onRollAdvancement,
      completeSession: SessionAdvancementDialog.prototype._onCompleteSession,
      complete: SessionAdvancementDialog.prototype._onComplete,
      nextStep: SessionAdvancementDialog.prototype._onNextStep,
      cancel: SessionAdvancementDialog.prototype._onCancel,
    },
  };

  static PARTS = {
    form: {
      template:
        "modules/dragonbane-campaign-assistant/templates/session-advancement.hbs",
      scrollable: [""],
    },
  };

  /**
   * Prepare context data for the template
   */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    // Check advancement roll mode early - needed for allSkillsForDisplay logic
    const advancementRollMode =
      Utils.getSetting(SETTINGS.ADVANCEMENT_ROLL_MODE) || "bulk";
    const isBulkMode = advancementRollMode === "bulk";
    const isIndividualMode = advancementRollMode === "individual";

    const markedSkills = Utils.getMarkedSkills(this.actor);
    const unmarkedSkills = Utils.getUnmarkedSkills(this.actor);

    // In individual mode Step 3, we need to show ALL skills that were marked at start of Step 3
    // (not just those with advance flag), so include rolled skills
    let allSkillsForDisplay = [...markedSkills];
    if (
      isIndividualMode &&
      this.currentStep === 3 &&
      this.skillsToRoll.size > 0
    ) {
      // Add any rolled skills that no longer have advance flag
      for (const skillId of this.skillsToRoll) {
        if (!markedSkills.find((s) => s.id === skillId)) {
          const skill = this.actor.items.get(skillId);
          if (skill) {
            allSkillsForDisplay.push(skill);
          }
        }
      }
    }

    // Get character's current weakness
    const currentWeakness =
      this.actor.system?.weakness || this.actor.system?.details?.weakness || "";

    // Check if weakness rule is enabled
    const useWeaknessRule = Utils.getSetting("useWeaknessRule");

    // Check which default questions are hidden
    const hideParticipated = Utils.getSetting("hideParticipated");
    const hideExplored = Utils.getSetting("hideExplored");
    const hideDefeated = Utils.getSetting("hideDefeated");
    const hideOvercame = Utils.getSetting("hideOvercame");

    // Get custom questions
    const customQuestionsText = Utils.getSetting("customQuestions") || "";
    const customQuestions = customQuestionsText
      .split(";")
      .map((q) => q.trim())
      .filter((q) => q.length > 0);

    // Prepare enabled default questions (filter out hidden ones)
    const defaultQuestionConfigs = [
      { id: "participated", hidden: hideParticipated },
      { id: "explored", hidden: hideExplored },
      { id: "defeated", hidden: hideDefeated },
      { id: "overcame", hidden: hideOvercame },
    ];

    const regularQuestions = defaultQuestionConfigs
      .filter((q) => !q.hidden)
      .map((q) => ({
        id: q.id,
        label: Utils.localize(`CAMPAIGN_ASSISTANT.questions.${q.id}`),
        checked: this.questionAnswers[q.id] || false,
        isCustom: false,
      }));

    // Add custom questions
    const customQuestionList = customQuestions.map((q, index) => ({
      id: `custom_${index}`,
      label: q,
      checked: this.customQuestionAnswers[`custom_${index}`] || false,
      isCustom: true,
    }));

    // Combine all questions
    const allQuestions = [...regularQuestions, ...customQuestionList];

    // Count yes answers from default questions (only count non-hidden ones)
    const regularMarks = defaultQuestionConfigs.filter(
      (q) => !q.hidden && this.questionAnswers[q.id]
    ).length;

    // Count yes answers from custom questions
    const customMarks = Object.values(this.customQuestionAnswers).filter(
      Boolean
    ).length;

    // Add weakness marks (0, 1, or 2) - only if rule is enabled
    let weaknessMarks = 0;
    if (useWeaknessRule) {
      if (this.questionAnswers.weakness === "gavein") weaknessMarks = 1;
      if (this.questionAnswers.weakness === "overcame") weaknessMarks = 2;
    }

    this.additionalMarks = regularMarks + customMarks + weaknessMarks;

    // Individual mode specific context
    // Use skillsToRoll (skills that needed rolling at start of Step 3) instead of markedSkills
    const allSkillsRolled =
      isIndividualMode &&
      this.skillsToRoll.size > 0 &&
      this.skillsToRoll.size === this.rolledSkills.size;

    return {
      ...context,
      actor: this.actor,
      currentStep: this.currentStep,
      isStep1: this.currentStep === 1,
      isStep2: this.currentStep === 2,
      isStep3: this.currentStep === 3,
      questions: allQuestions,
      useWeaknessRule: useWeaknessRule,
      currentWeakness: currentWeakness,
      hasWeakness: !!currentWeakness,
      weaknessAnswer: this.questionAnswers.weakness,
      weaknessNoneChecked: this.questionAnswers.weakness === "none",
      weaknessGaveInChecked: this.questionAnswers.weakness === "gavein",
      weaknessOvercameChecked: this.questionAnswers.weakness === "overcame",
      markedSkills: allSkillsForDisplay.map((s) => ({
        id: s.id,
        name: s.name,
        level: s.system.value,
        taught: !!s.system.taught,
        newlyMarked: !this.originalMarkedSkills.has(s.id),
        alreadyRolled: this.rolledSkills.has(s.id),
      })),
      unmarkedSkills: unmarkedSkills.map((s) => ({
        id: s.id,
        name: s.name,
        level: s.system.value,
        selected: this.selectedSkills.has(s.id),
        taught: !!s.system.taught,
      })),
      additionalMarks: this.additionalMarks,
      marksRemaining: this.additionalMarks - this.selectedSkills.size,
      canAddMore: this.selectedSkills.size < this.additionalMarks,
      hasSelectedSkills: this.selectedSkills.size > 0,
      hasMarkedSkills: allSkillsForDisplay.length > 0,
      // Mode flags
      isBulkMode: isBulkMode,
      isIndividualMode: isIndividualMode,
      allSkillsRolled: allSkillsRolled,
    };
  }

  /**
   * Handle form submission (ApplicationV2 style)
   */
  async _onFormSubmit(event, form, formData) {
    // Update default question answers from form data
    ["participated", "explored", "defeated", "overcame"].forEach((q) => {
      this.questionAnswers[q] = formData.object[`question_${q}`] || false;
    });

    // Handle custom questions
    const customQuestionsText = Utils.getSetting("customQuestions") || "";
    const customQuestions = customQuestionsText
      .split(";")
      .map((q) => q.trim())
      .filter((q) => q.length > 0);

    customQuestions.forEach((q, index) => {
      const customId = `custom_${index}`;
      this.customQuestionAnswers[customId] =
        formData.object[`question_${customId}`] || false;
    });

    // Handle weakness radio buttons
    this.questionAnswers.weakness = formData.object.question_weakness || "none";

    // Re-render to update available marks
    await this.render();
  }

  /**
   * Mark a skill for advancement (Step 2)
   */
  async _onMarkSkill(event, target) {
    const skillId = target.dataset.skillId;
    if (!skillId) return;

    const skill = this.actor.items.get(skillId);
    if (!skill) return;

    // Save current scroll position before re-render
    const skillList = this.element?.querySelector(".skill-list");
    const scrollTop = skillList ? skillList.scrollTop : 0;

    // Toggle selection
    if (this.selectedSkills.has(skillId)) {
      this.selectedSkills.delete(skillId);
    } else {
      // Check if we can add more
      if (this.selectedSkills.size >= this.additionalMarks) {
        ui.notifications.warn(
          Utils.localize("CAMPAIGN_ASSISTANT.warnings.noMoreMarks")
        );
        return;
      }
      this.selectedSkills.add(skillId);
    }

    // Re-render
    await this.render();

    // Restore scroll position after render
    await this.#restoreScrollPosition(scrollTop);
  }

  /**
   * Roll a single skill (Individual Mode only - Step 3)
   */
  async _onRollSingleSkill(event, target) {
    event?.preventDefault?.();
    event?.stopPropagation?.();

    const skillId = target.dataset.skillId;
    if (!skillId) return;

    // Check if already rolled - silently ignore
    if (this.rolledSkills.has(skillId)) {
      return;
    }

    const skill = this.actor.items.get(skillId);
    if (!skill) return;

    // Save scroll position
    const skillList = this.element?.querySelector(".skill-list.marked");
    const scrollTop = skillList ? skillList.scrollTop : 0;

    // Roll advancement for this skill
    const result = await this.#rollSkillAdvancement(skill);

    // Store result
    this.rollResults.push(result);

    // Mark as rolled
    this.rolledSkills.add(skillId);

    // Re-render to update UI
    await this.render();

    // Restore scroll position
    await this.#restoreScrollPosition(scrollTop);
  }

  /**
   * Helper method to roll advancement for a single skill
   */
  async #rollSkillAdvancement(skill) {
    const roll = await new Roll("1d20").evaluate();
    const success = roll.total > skill.system.value;

    // Calculate new level (capped at 18)
    const currentLevel = skill.system.value;
    const newLevel = success ? Math.min(currentLevel + 1, 18) : currentLevel;
    const reachedMaximum = success && newLevel === 18 && currentLevel < 18;

    if (success) {
      await skill.update({
        "system.value": newLevel,
        "system.advance": false,
        "system.taught": false,
      });

      // Special notification for reaching maximum
      if (reachedMaximum) {
        ui.notifications.info(
          Utils.format("CAMPAIGN_ASSISTANT.notifications.skillMaxed", {
            skill: skill.name,
            actor: this.actor.name,
          })
        );
      }
    } else {
      await skill.update({
        "system.advance": false,
        "system.taught": false,
      });
    }

    // Create chat message for the roll
    await roll.toMessage({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: success
        ? Utils.format("DoD.skill.advancementSuccess", {
            skill: skill.name,
            old: currentLevel,
            new: newLevel,
          })
        : Utils.format("DoD.skill.advancementFail", { skill: skill.name }),
    });

    return {
      skill: skill.name,
      skillId: skill.id,
      oldLevel: currentLevel,
      newLevel: newLevel,
      roll: roll.total,
      success,
      reachedMaximum,
    };
  }

  /**
   * Restore scroll position after render
   */
  async #restoreScrollPosition(scrollTop) {
    // Wait for next frame to ensure DOM is updated
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const skillList = this.element?.querySelector(".skill-list");
    if (skillList && scrollTop > 0) {
      skillList.scrollTop = scrollTop;
    }
  }

  /**
   * Roll all advancement (Bulk Mode only - Step 3)
   */
  async _onRollAdvancement(event, target) {
    event?.preventDefault?.(); // Prevent form submission

    const markedSkills = Utils.getMarkedSkills(this.actor);

    if (markedSkills.length === 0) {
      ui.notifications.warn(
        Utils.localize("CAMPAIGN_ASSISTANT.warnings.noMarkedSkills")
      );
      return;
    }

    // Confirm
    const confirmed = await foundry.applications.api.DialogV2.confirm({
      window: {
        title: Utils.localize("CAMPAIGN_ASSISTANT.dialog.confirmRoll.title"),
      },
      content: Utils.format("CAMPAIGN_ASSISTANT.dialog.confirmRoll.content", {
        count: markedSkills.length,
      }),
      yes: {
        label: Utils.localize("CAMPAIGN_ASSISTANT.dialog.confirmRoll.yes"),
      },
      no: { label: Utils.localize("CAMPAIGN_ASSISTANT.dialog.confirmRoll.no") },
    });

    if (!confirmed) return;

    // Roll advancement for each marked skill
    const results = [];

    for (const skill of markedSkills) {
      const result = await this.#rollSkillAdvancement(skill);
      results.push(result);
    }

    // Store session in history
    await this._saveSessionData(results);

    // Show summary
    await this._showSummary(results);

    // Record to journal via socket (GM will handle it)
    await this._recordToJournal(results);

    // Close dialog
    await this.close();
  }

  /**
   * Complete session (Individual Mode only - Step 3)
   * Called when all skills have been rolled individually
   */
  async _onCompleteSession(event, target) {
    event?.preventDefault?.();

    // Confirm
    const confirmed = await foundry.applications.api.DialogV2.confirm({
      window: {
        title: Utils.localize(
          "CAMPAIGN_ASSISTANT.dialog.confirmComplete.title"
        ),
      },
      content: Utils.localize(
        "CAMPAIGN_ASSISTANT.dialog.confirmComplete.content"
      ),
      yes: {
        label: Utils.localize("CAMPAIGN_ASSISTANT.dialog.confirmComplete.yes"),
      },
      no: {
        label: Utils.localize("CAMPAIGN_ASSISTANT.dialog.confirmComplete.no"),
      },
    });

    if (!confirmed) return;

    // Store session in history
    await this._saveSessionData(this.rollResults);

    // Show summary
    await this._showSummary(this.rollResults);

    // Record to journal via socket (GM will handle it)
    await this._recordToJournal(this.rollResults);

    // Close dialog
    await this.close();
  }

  /**
   * Complete session - mark selected skills and prepare for rolling (Step 2)
   */
  async _onComplete(event, target) {
    event?.preventDefault?.(); // Prevent form submission

    if (this.selectedSkills.size === 0) {
      ui.notifications.warn(
        Utils.localize("CAMPAIGN_ASSISTANT.warnings.noSkillsSelected")
      );
      return;
    }

    // Mark the selected skills - wait for all updates to complete
    const updates = [];
    for (const skillId of this.selectedSkills) {
      const skill = this.actor.items.get(skillId);
      if (skill && !skill.system.advance) {
        updates.push(skill.update({ "system.advance": true }));
      }
    }

    // Wait for all updates to finish
    await Promise.all(updates);

    // Give a small delay for Foundry to propagate the updates
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Clear selections since they're now marked
    this.selectedSkills.clear();

    // Move to step 3
    this.currentStep = 3;

    // In individual mode, capture the list of skills to roll
    const advancementRollMode =
      Utils.getSetting(SETTINGS.ADVANCEMENT_ROLL_MODE) || "bulk";
    if (advancementRollMode === "individual") {
      const markedSkills = Utils.getMarkedSkills(this.actor);
      this.skillsToRoll = new Set(markedSkills.map((s) => s.id));
    }

    // Re-render to show updated marked skills
    await this.render();
  }

  /**
   * Go to next step
   */
  async _onNextStep(event, target) {
    event?.preventDefault?.(); // Prevent form submission

    // If leaving step 1 and they overcame their weakness, handle removal (only if rule is enabled)
    const useWeaknessRule = Utils.getSetting("useWeaknessRule");
    if (
      useWeaknessRule &&
      this.currentStep === 1 &&
      this.questionAnswers.weakness === "overcame"
    ) {
      const confirmed = await foundry.applications.api.DialogV2.confirm({
        window: {
          title: Utils.localize(
            "CAMPAIGN_ASSISTANT.dialog.removeWeakness.title"
          ),
        },
        content: Utils.localize(
          "CAMPAIGN_ASSISTANT.dialog.removeWeakness.content"
        ),
        yes: {
          label: Utils.localize("CAMPAIGN_ASSISTANT.dialog.removeWeakness.yes"),
        },
        no: {
          label: Utils.localize(
            "CAMPAIGN_ASSISTANT.dialog.removeWeakness.cancel"
          ),
        },
      });

      if (confirmed) {
        // User clicked "Remove Weakness" - remove it and proceed
        // Try to remove weakness - try both possible locations
        if (this.actor.system.weakness !== undefined) {
          await this.actor.update({ "system.weakness": "" });
        } else if (this.actor.system.details?.weakness !== undefined) {
          await this.actor.update({ "system.details.weakness": "" });
        }

        ui.notifications.info(
          Utils.localize("CAMPAIGN_ASSISTANT.notifications.weaknessRemoved")
        );
      } else {
        // User clicked "Cancel" - reset weakness to 'none' and stay on step 1
        this.questionAnswers.weakness = "none";
        await this.render();
        return; // Don't proceed to next step
      }
    }

    // Proceed to next step
    if (this.currentStep < 3) {
      this.currentStep++;
      await this.render();
    }
  }

  /**
   * Cancel and close dialog
   */
  async _onCancel(event, target) {
    event?.preventDefault?.();

    const advancementRollMode =
      Utils.getSetting(SETTINGS.ADVANCEMENT_ROLL_MODE) || "bulk";
    const isIndividualMode = advancementRollMode === "individual";

    // If in Step 3 with individual mode and have rolled skills, confirm revert
    if (
      this.currentStep === 3 &&
      isIndividualMode &&
      this.rolledSkills.size > 0
    ) {
      const confirmed = await foundry.applications.api.DialogV2.confirm({
        window: {
          title: Utils.localize(
            "CAMPAIGN_ASSISTANT.dialog.confirmCancel.title"
          ),
        },
        content: Utils.localize(
          "CAMPAIGN_ASSISTANT.dialog.confirmCancel.content"
        ),
        yes: {
          label: Utils.localize("CAMPAIGN_ASSISTANT.dialog.confirmCancel.yes"),
        },
        no: {
          label: Utils.localize("CAMPAIGN_ASSISTANT.dialog.confirmCancel.no"),
        },
      });

      if (!confirmed) return;

      // Revert rolled skills
      const updates = [];
      for (const result of this.rollResults) {
        const skill = this.actor.items.get(result.skillId);
        if (skill) {
          updates.push(
            skill.update({
              "system.value": result.oldLevel,
              "system.advance": true,
            })
          );
        }
      }

      await Promise.all(updates);
      ui.notifications.info("Advancement cancelled - skills reverted");
    }

    // If in Step 2 or Step 3, unmark skills that were marked this session
    if (this.currentStep >= 2) {
      const updates = [];
      const markedSkills = Utils.getMarkedSkills(this.actor);

      for (const skill of markedSkills) {
        if (!this.originalMarkedSkills.has(skill.id)) {
          updates.push(skill.update({ "system.advance": false }));
        }
      }

      if (updates.length > 0) {
        await Promise.all(updates);
      }
    }

    await this.close();
  }

  /**
   * Save session data to actor history
   */
  async _saveSessionData(results) {
    if (!Utils.getSetting("trackSessionHistory")) return;

    const sessionData = {
      questions: this.questionAnswers,
      customQuestions: this.customQuestionAnswers,
      additionalMarks: this.additionalMarks,
      skillsAdvanced: results
        .filter((r) => r.success)
        .map((r) => ({
          skill: r.skill,
          oldLevel: r.oldLevel,
          newLevel: r.newLevel,
        })),
      date: new Date().toISOString(),
    };

    await Utils.addSessionToHistory(this.actor, sessionData);
  }

  /**
   * Show session summary in chat
   */
  async _showSummary(results) {
    const successCount = results.filter((r) => r.success).length;
    const heroicAbilitiesCount = results.filter((r) => r.reachedMaximum).length;

    const successList = results
      .filter((r) => r.success)
      .map((r) => {
        const maxLabel = r.reachedMaximum
          ? ` <strong>(${Utils.localize(
              "CAMPAIGN_ASSISTANT.chat.sessionSummary.maxSkillLevel"
            )})</strong>`
          : "";
        return `<li>${r.skill} (${r.oldLevel} → ${r.newLevel})${maxLabel}</li>`;
      })
      .join("");

    const heroicAbilitiesLine =
      heroicAbilitiesCount > 0
        ? `<p><strong>${Utils.format(
            "CAMPAIGN_ASSISTANT.chat.sessionSummary.heroicAbilitiesGained",
            { count: heroicAbilitiesCount }
          )}</strong></p>`
        : "";

    const content = `
      <div class="dragonbane campaign-assistant session-summary">
        <h3>${Utils.format("CAMPAIGN_ASSISTANT.chat.sessionSummary.title", {
          actor: this.actor.name,
        })}</h3>
        <p><strong>${Utils.format(
          "CAMPAIGN_ASSISTANT.chat.sessionSummary.marksUsed",
          { count: results.length }
        )}</strong></p>
        <p><strong>${Utils.format(
          "CAMPAIGN_ASSISTANT.chat.sessionSummary.skillsAdvanced",
          { count: successCount }
        )}</strong></p>
        ${heroicAbilitiesLine}
        ${
          successCount > 0
            ? `<ul>${successList}</ul>`
            : `<p><em>No skills advanced this session.</em></p>`
        }
      </div>
    `;

    await ChatMessage.create({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content: content,
    });
  }

  /**
   * ENHANCED: Record session to journal (via socket for GM)
   */
  async _recordToJournal(results) {
    const socket = game.modules.get(MODULE_ID).socket;
    if (!socket) {
      console.error("Socket not available for journal recording");
      return;
    }

    // Build comprehensive session data
    const sessionData = {
      actorId: this.actor.id,
      actorName: this.actor.name,
      timestamp: new Date().toISOString(),

      // Advancement results
      results: results,

      // Question answers
      questions: {
        participated: this.questionAnswers.participated,
        explored: this.questionAnswers.explored,
        defeated: this.questionAnswers.defeated,
        overcame: this.questionAnswers.overcame,
        weakness: this.questionAnswers.weakness, // 'none', 'gavein', or 'overcame'
      },

      // Custom questions
      customQuestions: this.customQuestionAnswers,

      // Weakness information
      weakness: {
        text: this.weaknessAtStart, // The actual weakness text
        choice: this.questionAnswers.weakness, // What they chose
      },

      // Marks breakdown
      marks: {
        fromQuestions: this.additionalMarks,
        fromAutoMarks: results.length - this.additionalMarks,
        total: results.length,
      },

      // Skills selected in Step 2 (newly marked this session)
      skillsMarkedThisSession: Array.from(this.selectedSkills)
        .map((skillId) => {
          const skill = this.actor.items.get(skillId);
          return skill
            ? {
                id: skill.id,
                name: skill.name,
                level: skill.system.value,
              }
            : null;
        })
        .filter((s) => s !== null),
    };

    // Call the enhanced socket event
    await socket.executeForEveryone(
      SOCKET_EVENTS.RECORD_ADVANCEMENT,
      sessionData
    );
  }
}
