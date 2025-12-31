# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2025-01-01

### Added

- **Session Advancement Workflow** - Complete implementation of the 5 advancement questions from Dragonbane rulebook
- **Bulk Skill Rolling** - Roll all marked skills at once with automatic level increases
- **Automatic GM Journals** - Session advancement history automatically recorded in GM journals organized by character
- **Customizable Questions** - Four checkboxes to hide default advancement questions
- **Custom Questions** - Add house-rule advancement questions (semicolon-separated)
- **Optional Weakness Rule** - Enable/disable the weakness advancement question (disabled by default)
- **Level 18 Cap** - Skills automatically cap at maximum level with special celebration notifications
- **Visual Skill Differentiation** - Blue for pre-marked skills, teal for newly selected skills
- **Session History API** - Track advancement history in actor flags for API access
- **Cross-Client Support** - Seamless socket integration for multi-user sessions
- **Localization** - Full English and Swedish translations
- **Character Sheet Button** - Optional "Session" button on character sheets (up arrow in header) for player-initiated advancement
- **Chat Integration** - Session summaries posted to chat with detailed skill advancement results

### Features

- Three-step wizard interface with clear visual progression
- Dynamic marks counter showing remaining advancement marks
- Weakness removal dialog with rulebook reminder about session requirements
- Smart filtering to exclude level 18 skills from selection
