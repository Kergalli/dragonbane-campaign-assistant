# Dragonbane Campaign Assistant

![Version](https://img.shields.io/badge/version-1.0.0-blue)
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

**Bulk Advancement Rolling:**

- **Roll all marked skills at once** - No more clicking through each skill individually
- **Level 18 cap enforcement** - Skills automatically cap at maximum level
- **Heroic ability celebration** - Special notifications when skills reach level 18

**Automatic GM Journals:**

- **One journal per character** - Organized in "Advancement History" folder
- **Session summaries** - Date, marks used, skills advanced, number of heroic abilities gained
- **Campaign-long tracking** - Complete advancement history for entire campaign
- **Cross-client support** - Works when players trigger advancement, GM's client writes to journal
- **No permission setup** - Journals stay GM-owned, automatically managed

**Player & GM Controls:**

- **Player button** - "Session" button on character sheets for individual advancement
- **Socket integration** - Seamless cross-client communication for multi-user sessions

**Visual Polish:**

- **Color-coded skills** - Blue for pre-marked skills, teal for newly selected skills
- **Graduation cap icons** - Visual indicator for skills trained with a teacher
- **Dynamic counters** - Real-time display of remaining advancement marks

---

## ⚙️ **Configuration**

**Access**: Game Settings → Configure Settings → Dragonbane Campaign Assistant

### **Session Advancement**

- **Add Character Sheet Buttons** - Adds "Session" button (up arrow in character sheet header) for player-initiated advancement
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
6. Click "Roll All Advancement" to roll everything at once
7. View session summary in chat

### **Example: Session Advancement**

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

---

## 🌍 **Localization & Support**

- **Languages**: Full support for English and Swedish using official Dragonbane translation keys
- **Support**: [GitHub Issues](https://github.com/Kergalli/dragonbane-campaign-assistant/issues)

---

## ⚖️ **License & Disclaimer**

MIT License. This is an unofficial, fan-created module. Not affiliated with Free League Publishing. Dragonbane™ is a trademark of Free League Publishing.
