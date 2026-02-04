# Dragonbane Campaign Assistant

![Version](https://img.shields.io/badge/version-1.2.0-blue)
![Foundry Version](https://img.shields.io/badge/foundry-v13-green)
![System](https://img.shields.io/badge/system-dragonbane-orange)

**Dragonbane Campaign Assistant** enhances campaign management and character progression for the Dragonbane RPG system by Free League Publishing.

---

## 🚀 **Installation**

1. In Foundry VTT: **Add-on Modules** → **Install Module**
2. Manifest URL: `https://github.com/Kergalli/dragonbane-campaign-assistant/releases/latest/download/module.json`
3. Enable in **Manage Modules**

---

## ✨ **Key Features**

_Currently focused on session-end advancement workflows. Additional campaign management features planned._

### 📋 **Session Advancement Workflow**

Implements the complete session-end advancement system from page 29 of the Dragonbane rulebook.

**The 5 Advancement Questions:**

- **Official questions** - All 5 advancement questions from the rulebook (4 default + weakness optional)
- **Customizable** - Hide any default questions or add custom house-rule questions
- **Smart skill selection** - Choose which unmarked skills to mark for advancement
- **Weakness tracking** - Optional rule (disabled by default) with automatic removal dialog when overcome

**Flexible Advancement Rolling:**

Choose your preferred rolling style with the **Advancement Roll Mode** setting:

- **Bulk Rolling** (default) - Roll all marked skills at once with one consolidated summary
  - Fast and efficient for large skill lists
  - Single "Roll All Advancement" button
  - Consolidated session summary in chat
- **Individual Rolling** - Click each skill to roll them one at a time
  - Perfect for dramatic moments or important skills
  - D20 icon shows skills ready to roll
  - Click any skill to roll it immediately
  - Skills gray out after rolling with checkmark indicator
  - "Complete Session" button appears when all skills are rolled
  - Full session summary and journal recording after completion

Both modes include:

- **Level 18 cap enforcement** - Skills automatically cap at maximum level
- **Heroic ability celebration** - Special notifications when skills reach level 18
- **Automatic chat messages** - Individual skill roll results posted to chat
- **Full journal recording** - Complete session history with all advancement details

**Automatic GM Journals:**

- **One journal per character** - Organized in "Advancement History" folder
- **Session summaries** - Date, questions answered, weakness engagement, marks used, skills advanced, number of heroic abilities gained
- **Campaign-long tracking** - Complete advancement history for entire campaign
- **Cross-client support** - Works when players trigger advancement, GM's client writes to journal
- **No permission setup** - Journals stay GM-owned, automatically managed

**Player & GM Controls:**

- **Player button** - "Session" button on character sheets for individual advancement
- **Socket integration** - Seamless cross-client communication for multi-user sessions

**Visual Polish:**

- **Color-coded skills** - Teal-colored skills track new skills that were selected during advancement
- **Graduation cap icons** - Visual indicator for skills trained with a teacher
- **Dynamic counters** - Real-time display of remaining advancement marks
- **Dark mode support** - Proper button styling for both light and dark Foundry VTT themes

---

## ⚙️ **Configuration**

**Access**: Game Settings → Configure Settings → Dragonbane Campaign Assistant

### **Session Advancement**

- **Add Character Sheet Buttons** - Adds "Session" button (up arrow in character sheet header) for player-initiated advancement
- **Advancement Roll Mode** - Choose between Bulk Rolling (all at once) or Individual Rolling (click each skill)
- **Track Session History** - Saves detailed advancement history in actor flags for API access
- **Use Weakness Optional Rule** - Enable the weakness question in session advancement (optional rule from rulebook)
- **Hide Default Questions** - Four checkboxes to hide any of the 4 default advancement questions
- **Custom Advancement Questions** - Add custom house-rule questions (semicolon-separated, each grants 1 mark)

---

## 🎮 **Usage & Workflows**

### **Session Advancement Workflow**

**End-of-Session Process:**

**For Players:**

1. Click "Session" button on character sheet (up arrow in character sheet header)
2. Answer the advancement questions (each "yes" = 1 skill mark)
3. Select which unmarked skills to mark for advancement
4. Click "Mark Selected Skills" to prepare skills
5. Review all marked skills (from questions + auto-marks from Dragon/Demon rolls)
6. **Choose your rolling method:**
   - **Bulk Mode**: Click "Roll All Advancement" → all skills roll at once → view summary
   - **Individual Mode**: Click each skill to roll → "Complete Session" when done → view summary
7. Session summary posted to chat, journal updated automatically

### **Example: Bulk Rolling Mode (Default)**

**Scenario:** Player answers 3 "yes" questions and already has 2 skills marked from Dragon rolls during play.

1. **Step 1 - Questions:** Player answers 3 questions, earning 3 additional marks
2. **Step 2 - Selection:** Display shows "Advancement Marks Available: 3"
   - Player selects 3 skills from unmarked list
   - Counter updates: 3 → 2 → 1 → 0 as skills are selected
   - Checkmarks turn teal to show new selections
3. **Step 3 - Ready to Roll:** Shows all 5 marked skills (2 blue = from play, 3 teal = from questions)
4. **Rolling:** Clicks "Roll All Advancement"
   - System rolls each skill individually
   - Successful rolls increase skill levels
   - Any skill reaching 18 triggers special notification
5. **Summary:** Chat shows session results with date, marks used, skills advanced

### **Example: Individual Rolling Mode**

**Scenario:** Same as above, but using individual rolling for important skills.

1. **Steps 1-2:** Same as bulk mode - answer questions, select 3 skills to mark
2. **Step 3 - Ready to Roll:** Shows all 5 marked skills with D20 icons
3. **Individual Rolling:**
   - Clicks "Acrobatics" → rolls 14 → skill increases 12 → 13
   - Clicks "Sneaking" → rolls 8 → skill increases 16 → 17
   - Clicks "Swords" → rolls 19 → no increase (failed)
   - Continues through remaining skills
   - Each roll posts to chat immediately
4. **Completion:** All skills show checkmarks, clicks "Complete Session"
   - Confirms completion
   - Journal entry created with full session details
   - Chat summary shows final results
5. **Cancel Safety:** Can click Cancel at any time before Complete Session
   - Confirms before reverting
   - All individual rolls are reverted
   - Marks from Step 2 are removed

---

## 📋 **System Requirements & Dependencies**

### **Required**

| Requirement           | Version | Notes                                              |
| --------------------- | ------- | -------------------------------------------------- |
| **Foundry VTT**       | v13+    | Uses ApplicationV2 and modern dialog APIs          |
| **Dragonbane System** | v2.6.0+ | Required for skill marking and advancement rolling |
| **socketlib**         | Latest  | Required for cross-client journal writing          |

### **Compatibility Notes**

- **ApplicationV2**: Module uses Foundry v13's modern application framework
- **Native Integration**: Works seamlessly with Dragonbane system's built-in advancement mechanics
- **Dark Mode**: Fully compatible with Foundry VTT's dark mode interface

---

## 🌍 **Credits & Support**

### **Community & Support**

- **Issues**: [GitHub Issues](https://github.com/Kergalli/dragonbane-campaign-assistant/issues)
- **Documentation**: [Complete Changelog](CHANGELOG.md)
- **Community**: Dragonbane Community Discord

### **Community Contributors**

- **LuckyFrico** - Italian language localization

---

## ⚖️ **License & Disclaimer**

MIT License.

This VTT module is not affiliated with, sponsored, or endorsed by Fria Ligan AB. This Supplement was created under Fria Ligan AB's [Dragonbane Third Party Supplement License](https://freeleaguepublishing.com/wp-content/uploads/2023/11/Dragonbane-License-Agreement.pdf).

![A Supplement For Dragonbane](https://raw.githubusercontent.com/Kergalli/dragonbane_macros/refs/heads/main/dragonbane-license-logo-red.png)
