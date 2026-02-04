# Changelog

All notable changes to the Dragonbane Campaign Assistant module will be documented in this file.

---

## [1.2.0] - 2025-02-04

### Enhanced

- **Journal Recording System** - Complete visual overhaul with improved formatting
  - Blockquote-style sections matching Dragonbane parchment aesthetic
  - Enhanced data capture including weakness at session start and comprehensive marks breakdown

---

## [1.1.0] - 2025-01-05

### ✨ Added - Major Features

**Advancement Roll Mode Setting**

- **Flexible Rolling Workflows**: New module setting to choose between two rolling styles
  - **Bulk Rolling** (default) - Roll all marked skills at once
  - **Individual Rolling** - Click each skill to roll individually for dramatic effect

**Individual Rolling Workflow**

- **Click-to-Roll System**: Skills are clickable with D20 icons in Step 3
  - Each skill posts roll results to chat immediately
  - Skills gray out after rolling with checkmark indicators
  - "Complete Session" button appears when all skills are rolled
  - Session summary and journal entry created after completion

**Enhanced Cancel Functionality**

- **Smart Cancel Handling**: Cancel button adapts to dialog state with confirmations
  - Step 2: Removes marks added during current session
  - Step 3 Individual Mode: Confirms before reverting all rolls and marks

### 🐛 Bug Fixes

**Dark Mode Button Styling**

- **Fixed Button Text Visibility**: Buttons now readable in Foundry VTT dark mode
  - Consistent hover states across light and dark themes

**Level 18 Skills in Step 3**

- **Fixed Level 18 Skills Appearing as Rollable**: Skills at maximum level (18) no longer appear in Step 3
  - Resolves issue where dragon/demon rolls on maxed skills marked them behind the scenes
  - Step 3 now filters out level 18 skills regardless of mark status

### 🎨 Enhanced - UI/UX Improvements

**Visual State Indicators**

- **Improved Skill Status Clarity**: Better visual distinction between skill states
  - D20 icon for skills ready to roll
  - Checkmark circle for already-rolled skills
  - Grayed background for completed rolls

### 🌍 Localization Improvements

#### 🇮🇹 Italian Language Support

- **Italian Localization**: Complete Italian translation now available (contribution by **LuckyFrico**)
- **Full Coverage**: All settings, actions, combat rules, journey actions, and UI elements fully translated

---

## [1.0.0] - 2025-01-01

### 🎉 Initial Release - Complete Session Advancement System

### ✨ Added - Major Features

**Session Advancement Workflow**

- **Complete Implementation**: Automates session-end advancement from page 29 of Dragonbane rulebook
  - All 5 official advancement questions (4 default + optional weakness rule)
  - Custom questions support (semicolon-separated)
  - Four checkboxes to hide default questions
  - Optional weakness rule (disabled by default)

**Bulk Skill Rolling**

- **One-Click Advancement**: Roll all marked skills at once with automatic level increases
  - Level 18 cap enforcement
  - Heroic ability celebrations when skills reach maximum level
  - Individual chat messages for each skill roll

**Automatic GM Journals**

- **Session History Tracking**: Complete advancement history automatically recorded
  - One journal per character in "Advancement History" folder
  - Session summaries with date, marks used, skills advanced
  - Cross-client support via socketlib
  - No permission setup required

**Visual Features**

- **Color-Coded Skills**: Teal for newly marked skills, blue for existing marks
- **Graduation Cap Icons**: Visual indicator for skills trained with teachers
- **Dynamic Counters**: Real-time display of remaining advancement marks

**Character Sheet Integration**

- **Session Advancement Button**: Optional button in character sheet header
  - Player-initiated advancement
  - Requires reload after enabling

**Three-Step Wizard Interface**

- **Clear Progression**: Professional dialog with numbered steps
  - Step 1: Answer questions, earn marks
  - Step 2: Select skills to mark
  - Step 3: Roll advancement

**Smart Filtering**

- **Intelligent Skill Management**: Prevents invalid selections
  - Excludes level 18 skills from Step 2
  - Warning when trying to over-mark
  - Weakness removal dialog with rulebook reminder

### 🔧 Technical Features

**Session History API**

- **Developer-Friendly**: Advancement data stored in actor flags
  - Structured data with timestamps and session numbering
  - API access for other modules

**Cross-Client Integration**

- **socketlib Integration**: Seamless multi-user support
  - Players trigger advancement, GM's client writes journal

### 🌍 Localization

- **English and Swedish**: Full translations using official Dragonbane terminology

---
