# ECHO VTT — UI Design Specification

## 1. Brand & Identity

**Product name:** ECHO VTT  
**Tagline:** *Worlds built by you. Brought to life by AI.*

ECHO is a fantasy tabletop RPG platform. It is not D&D — it uses its own vocabulary and mechanics.

| ECHO Term | Generic equivalent |
|---|---|
| Game Master (GM) | Dungeon Master |
| Chronicle | Campaign |
| Chronicler | Character sheet |
| Ether | Magic / Mana |
| Binding | Spell / Ability |
| Echo Score | Stat modifier |
| Fracture | Critical hit |
| Veil | Fog of war |

---

## 2. Design System

### 2.1 Color Palette

```
Background base      #0D0F14   near-black with blue tint
Surface layer 1      #13161E   card/panel backgrounds
Surface layer 2      #1B1F2B   elevated panels, modals
Border default       #2A2F3D   subtle dividers
Border accent        #4A3F6B   active/hovered elements

Primary accent       #7C5CBF   arcane purple
Primary glow         #A07EE8   lighter purple for glows/hovers
Gold accent          #C9A84C   treasure, GM controls, headings
Gold muted           #8A6F30   secondary gold

Text primary         #E8E0D0   parchment-white body text
Text secondary       #9A9080   muted labels
Text heading         #F5ECD6   brighter headings

Combat red           #C0392B   enemy HP, danger states
Combat red glow      #E74C3C   combat mode border pulse
Heal green           #27AE60   healing, ally buffs
Status yellow        #F39C12   conditions, warnings

Veil overlay         rgba(0,0,0,0.72)   fog of war tint
```

### 2.2 Typography

```
Display / Logo       "Cinzel" (Google Fonts) — used ONLY for ECHO logo, screen titles
Headings             "Cinzel Decorative" — section headers, chronicle names
Body / UI            "Inter" — all labels, buttons, stats, menus
Narration feed       "Lora" italic — AI-generated story text in the narration panel
Monospace / Dice     "JetBrains Mono" — dice rolls, initiative numbers, coordinates
```

### 2.3 Spacing & Grid

- Base unit: `4px`
- Panel padding: `16px` inner, `8px` gap between panels
- Map grid cell: `48px × 48px` default (scales down for larger maps)
- Combat card: `120px × 160px`
- Border radius: `4px` panels, `8px` cards, `24px` pills/badges

### 2.4 Iconography

Use **Lucide React** icons throughout. No emoji in game UI. Custom SVG icons for:
- Chronicle icon (scroll)
- Binding icon (arcane circle)
- Veil icon (eye with slash)
- Fracture icon (shattering crystal)

---

## 3. Application Shells

Two distinct shells. Users are routed to one based on their role.

```
/                  → Marketing / Login landing page
/gm/*              → GM Shell (Chronicle Builder + Live Session)
/play/:joinCode    → Player Shell (Exploration + Combat)
/lobby/:joinCode   → Player pre-game lobby
```

---

## 4. Marketing & Auth Landing Page  `/`

```
┌─────────────────────────────────────────────────────────────┐
│  ECHO VTT                            [Log In]  [Start Free] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│         ╔═══════════════════════════════════╗              │
│         ║   WORLDS BUILT BY YOU.            ║              │
│         ║   BROUGHT TO LIFE BY AI.          ║              │
│         ║                                   ║              │
│         ║   [Create a Chronicle →]          ║              │
│         ╚═══════════════════════════════════╝              │
│                   (animated map background)                  │
│                                                             │
├──────────┬──────────────┬──────────────┬───────────────────┤
│ AI-built │  Real-time   │  No prep     │  Play anywhere    │
│ worlds   │  multiplayer │  needed      │  (browser)        │
└──────────┴──────────────┴──────────────┴───────────────────┘
```

- Full-bleed background: looping generated map tile animation, darkened
- Single primary CTA per section
- Auth: email/password + Google OAuth. No username usernames — display names only.

---

## 5. GM Shell

The GM shell has a persistent left sidebar for navigation and a main content area.

```
┌──────┬──────────────────────────────────────────────────────┐
│ ECHO │  [Chronicle Name]                    [Session: LIVE] │
├──────┼──────────────────────────────────────────────────────┤
│      │                                                      │
│ Nav  │                  Main Content Area                   │
│      │                                                      │
│  ◉   │                                                      │
│ Home │                                                      │
│      │                                                      │
│  ◎   │                                                      │
│Build │                                                      │
│      │                                                      │
│  ◎   │                                                      │
│ Play │                                                      │
│      │                                                      │
│  ◎   │                                                      │
│Party │                                                      │
│      │                                                      │
│──────│                                                      │
│  ⚙   │                                                      │
│Sett. │                                                      │
└──────┴──────────────────────────────────────────────────────┘
```

GM left nav icons (48px wide collapsed, 200px expanded on hover):
- **Home** — Chronicle dashboard / my chronicles list
- **Build** — Chronicle Builder (AI prompting flow)
- **Play** — Live Session panel
- **Party** — Player management, link sharing
- **Settings** — Billing, account

---

## 6. Chronicle Builder  `/gm/build`

The GM builds the entire chronicle through a structured AI prompting wizard. Progress is saved at each step. The GM can return and regenerate any step.

### 6.1 Wizard Step Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Build Chronicle                           [Save & Exit]    │
├───────────────────────────────────────────────────────────  │
│  ① World  ②  Story  ③  Factions  ④  Scenes  ⑤  Bestiary  │
│  [████████████░░░░░░░░░░░░░░░░░░░░░░]  Step 2 of 5         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  STEP TITLE (e.g. "Shape Your World")                       │
│  Subtitle explanation of this step                          │
│                                                             │
│  ┌─────────────────────────┐  ┌──────────────────────────┐ │
│  │                         │  │                          │ │
│  │   AI PROMPT PANEL       │  │   PREVIEW / OUTPUT       │ │
│  │                         │  │                          │ │
│  │  [Guided questions      │  │  [AI-generated result    │ │
│  │   and free-text input]  │  │   shown here, editable]  │ │
│  │                         │  │                          │ │
│  │  [Image upload zone]    │  │  [Regenerate ↺]          │ │
│  │                         │  │                          │ │
│  └─────────────────────────┘  └──────────────────────────┘ │
│                                                             │
│                              [← Back]   [Next Step →]      │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 AI Prompt Panel — Question Types

Each step shows a mix of:

**Choice chips** (multi-select, no typing needed):
```
Tone of your world:
[Dark & Gritty]  [High Fantasy]  [Horror]  [Comedic]  [Political]
```

**Slider scale:**
```
Combat Frequency:   Rare ─────●──── Constant
Magic Prevalence:   Low  ──●──────── High
```

**Free-text expansion:**
```
Describe your world in your own words (optional):
┌─────────────────────────────────────────────────────┐
│ e.g. "A dying empire at the edge of a cursed sea..."│
└─────────────────────────────────────────────────────┘
```

**Image upload zone:**
```
┌──────────────────────────────────────┐
│                                      │
│   ⊕ Drop images for visual           │
│     inspiration (up to 6)            │
│                                      │
│   [Browse Files]                     │
│                                      │
│   thumbnail  thumbnail  thumbnail    │
└──────────────────────────────────────┘
```

Uploaded images are sent to the AI image analysis pipeline. The GM sees a note: "AI will use these for scene generation, not reproduce them directly."

### 6.3 Wizard Steps

| Step | Questions Asked |
|---|---|
| 1. World | Tone, setting era, geography style, magic system style, inspiration images |
| 2. Story | Central conflict, stakes, antagonist type, campaign length (# sessions), player agency level |
| 3. Factions | How many factions, alignment spread, faction naming style, are factions visible to players |
| 4. Scenes | Starting location type, scene density, exploration vs. combat ratio, hazard types |
| 5. Bestiary | Enemy variety, difficulty curve, boss frequency, enemy visual style, loot style |

After step 5 the AI generates:
- A Chronicle overview document (shown to GM, optionally shared with players)
- A set of starting scene tiles
- The opening encounter or hook
- A bestiary with stat blocks for 8–12 enemies

---

## 7. GM Dashboard  `/gm/home`

```
┌───────────────────────────────────────────────────────────────┐
│  My Chronicles                               [+ New Chronicle]│
├──────────────────────┬──────────────────────┬─────────────────┤
│  ┌────────────────┐  │  ┌────────────────┐  │  ┌───────────┐  │
│  │ [map preview]  │  │  │ [map preview]  │  │  │    + New  │  │
│  │                │  │  │                │  │  │ Chronicle │  │
│  │ The Iron Coast │  │  │ Ashveil        │  │  └───────────┘  │
│  │ 3 players      │  │  │ 5 players      │  │                 │
│  │ Session 4      │  │  │ Session 1      │  │                 │
│  │ [▶ Resume]     │  │  │ [▶ Resume]     │  │                 │
│  │ [⚙ Manage]    │  │  │ [⚙ Manage]    │  │                 │
│  └────────────────┘  │  └────────────────┘  │                 │
└──────────────────────┴──────────────────────┴─────────────────┘
```

Chronicle card states:
- **Active** — green dot, "Resume Session" CTA
- **Paused** — yellow dot, "Resume Session" CTA  
- **Draft** — grey dot, "Continue Building" CTA
- **Archived** — muted, "View" CTA

---

## 8. Party Panel  `/gm/party`

```
┌───────────────────────────────────────────────────────────────┐
│  Party & Access                              [Invite Players] │
├──────────────────────────────────────────────────────────────┤
│  Chronicle: The Iron Coast                                    │
│                                                               │
│  Share Link:  echo-vtt.com/play/XJ7-IRON-C5        [Copy]   │
│  QR Code:     [■■■■]                                         │
│                                                               │
│  ─── Active Players ───────────────────────────────────────  │
│                                                               │
│  [Avatar] Kaelia Dawnwhisper         Joined ✓   [Remove]    │
│           Elf Pathfinder · Level 3                           │
│                                                               │
│  [Avatar] Brund Ironfist             Joined ✓   [Remove]    │
│           Dwarf Vanguard · Level 3                           │
│                                                               │
│  [Avatar] (Open Slot)                Pending    [Revoke]    │
│                                                               │
│  ─── GM Controls ─────────────────────────────────────────  │
│  Max players: [4 ▼]    Allow late joins: [ON]               │
└──────────────────────────────────────────────────────────────┘
```

---

## 9. Live Session Panel  `/gm/play`

The GM sees a bird's-eye overview of everything happening. Players see the exploration/combat views (Section 11–12). The GM does not play on a separate device — this panel runs on their screen.

```
┌──────────────────────────────────────────────────────────────┐
│  [◉ LIVE]  The Iron Coast · Session 4        [End Session]   │
├──────┬─────────────────────────────────────┬─────────────────┤
│ GM   │                                     │  PARTY STATUS   │
│ CTRL │        MAP OVERVIEW                 │                 │
│      │   (full scene, all positions)       │  Kaelia    ❤ 28 │
│[+Enc]│                                     │  Brund     ❤ 34 │
│      │   Players shown as colored dots     │                 │
│[+NPC]│   NPCs shown as red diamonds        │  ─ NPCs ──────  │
│      │   Fog shown (GM sees all)           │  Guard x2   ❤12 │
│[+Env]│                                     │  Witch      ❤40 │
│      │                                     │                 │
│[Veil]│                                     │  ─ Initiative ─ │
│ ctrl │                                     │  (empty)        │
│      │                                     │                 │
│[◻Amb]│                                     │ [Start Combat]  │
├──────┴─────────────────────────────────────┴─────────────────┤
│  GM NARRATION OVERRIDE:                                       │
│  ┌─────────────────────────────────────────────┐  [Send ▶]  │
│  │  Type to push narration text to all players │            │
│  └─────────────────────────────────────────────┘            │
│  [Ask AI to narrate this moment]  [Trigger scene event]     │
└──────────────────────────────────────────────────────────────┘
```

**GM Control buttons (left sidebar in panel):**

| Button | Action |
|---|---|
| `+ Encounter` | AI generates and deploys an enemy group in the current scene |
| `+ NPC` | Spawn a named NPC; AI gives it a voice/personality |
| `+ Environment` | Add an environmental hazard or interactive object |
| `Veil ctrl` | Fog of war brush — reveal/hide tiles by clicking on the map |
| `◻ Ambient` | Toggle ambient sound / music mood (calm / tense / battle) |

---

## 10. Player Join Flow

### 10.1 Join Landing  `/play/:joinCode`

```
┌──────────────────────────────────────────────────────────────┐
│  ECHO VTT                                                    │
│                                                              │
│           You've been invited to:                            │
│                                                              │
│           ╔═══════════════════════════╗                     │
│           ║  THE IRON COAST           ║                     │
│           ║  Game Master: AlphaDM     ║                     │
│           ║  3 of 4 players joined    ║                     │
│           ╚═══════════════════════════╝                     │
│                                                              │
│           [Log in to join]  [Join as Guest]                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 10.2 Character Creation Lobby  `/lobby/:joinCode`

```
┌──────────────────────────────────────────────────────────────┐
│  ECHO VTT · The Iron Coast                                   │
├────────────────────────────┬─────────────────────────────────┤
│  YOUR CHARACTER            │  PARTY LOBBY                    │
│                            │                                 │
│  [Character portrait       │  Kaelia Dawnwhisper  ✓ Ready   │
│   generated from your      │  Brund Ironfist      ✓ Ready   │
│   choices, shown here]     │  (You)               ○ Building │
│                            │  (Open slot)         — —       │
│  Name: ____________        │                                 │
│  Class: [Vanguard ▼]       │  ─── Chronicle Lore ──────────  │
│  Origin: [Coastal ▼]       │  [The GM has shared a          │
│  Ether affinity: [Fire ▼]  │   summary of the world         │
│                            │   and starting situation]       │
│  Appearance prompt:        │                                 │
│  ┌──────────────────────┐  │                                 │
│  │ Describe your look   │  │                                 │
│  └──────────────────────┘  │                                 │
│  [Generate Portrait]       │                                 │
│                            │  GM is waiting...               │
│  [✓ Ready to Play]         │  [Chat with party]              │
└────────────────────────────┴─────────────────────────────────┘
```

Character classes are original to ECHO. Examples:
- **Vanguard** (tank/melee)
- **Pathfinder** (ranger/scout)
- **Arcanist** (mage)
- **Warden** (druid/nature)
- **Specter** (rogue/shadow)
- **Herald** (bard/support)
- **Ironwright** (artificer/tech)

---

## 11. Player Exploration View

Active when not in combat. Players move their character with WASD. The world scrolls around them. Other players are visible in real time.

```
┌──────────────────────────────────────────────────────────────┐
│  ECHO VTT  ·  The Iron Coast  ·  Session 4       [Menu ≡]   │
├──────────────────────────────────────────────────────────────┤
│ ┌────────┐  ┌────────────────────────────────────┐  ┌──────┐│
│ │        │  │                                    │  │      ││
│ │  MINI  │  │         MAIN MAP VIEWPORT          │  │ NAR  ││
│ │  MAP   │  │         (2D top-down tiles)        │  │ RAT  ││
│ │        │  │         WASD to move               │  │ ION  ││
│ │[■]     │  │                                    │  │      ││
│ │  □     │  │  [Player sprite animated]          │  │ FEED ││
│ │    ■   │  │  [Other players visible]           │  │      ││
│ │        │  │  [NPC sprites]                     │  │(AI   ││
│ │        │  │  [Veil tiles = black/dark]         │  │story ││
│ │        │  │  [Interactive objects glow]        │  │text) ││
│ └────────┘  └────────────────────────────────────┘  │      ││
│                                                      │      ││
├─────────────────────────────────────────────────┐   │PARTY ││
│  HOTBAR (8 slots)                               │   │      ││
│  [Binding 1] [Binding 2] [Item] [Item] [●Rest]  │   │P1 ❤  ││
│  Q           E           1      2       R       │   │P2 ❤  ││
└─────────────────────────────────────────────────┘   └──────┘│
└──────────────────────────────────────────────────────────────┘
```

**Map viewport details:**
- Renders tile sprites (stone, grass, lava, wood, etc.) from the generator
- Smooth pixel-art scroll, no jarring jumps
- Characters rendered as 32×32 pixel sprites with idle/walk animations
- Veil tiles render as pure black; revealing tiles fades them in
- Interactive objects (doors, chests, NPCs) have a soft gold outline pulse
- Hovering an NPC shows a tooltip with their name

**Minimap:**
- 120×120px fixed in the upper-left of the map area
- Shows player as white dot, party as colored dots, revealed terrain only
- Click to not center (movement is WASD only)

**Narration Feed:**
- Right panel, fixed 240px wide
- Scrolling feed of AI-generated narration text in Lora italic
- New entries slide in from bottom
- Entry types: `[NARRATION]` purple label, `[SYSTEM]` grey label, `[GM]` gold label
- Max visible: last 20 entries; scroll up for history

**Hotbar:**
- 8 bindable slots, bottom of screen
- Keys: Q, E, 1, 2, 3, 4, 5, R
- Each slot shows: ability icon, name truncated, cooldown overlay
- `R` is always Rest (out-of-combat HP regen action)

---

## 12. Combat View

Combat is triggered by the GM or by a player entering a flagged zone. A transition animation plays (screen flashes red, grid overlays the map). The exploration layout is replaced by the combat layout on all player screens simultaneously.

```
┌──────────────────────────────────────────────────────────────┐
│  ⚔ COMBAT  ─────────────────────────────────────────────────│
│  Initiative: [Kaelia ▶][Brund][Guard][Guard][Witch]         │
├───────────┬────────────────────────────────┬─────────────────┤
│           │                                │                 │
│  ENEMY    │      BATTLE MAP                │   COMBAT LOG    │
│  PANEL    │  (same tile viewport,          │                 │
│           │   now shows grid overlay)      │  Kaelia moved   │
│  Guard A  │                                │  north.         │
│  ❤ 12/24  │  [Turn indicator arrow         │                 │
│  [Target] │   above active character]      │  Brund used     │
│           │                                │  Ironshield.    │
│  Guard B  │  [Red outline around           │                 │
│  ❤ 8/24   │   enemy sprites]               │  Guard A        │
│  [Target] │                                │  attacked for   │
│           │  [Green outline on             │  7 damage.      │
│  Witch    │   active friendly]             │                 │
│  ❤ 40/40  │                                │  ─────────      │
│  [Target] │  Movement range shown          │  [Dice rolls    │
│           │  as blue highlight on          │  displayed      │
│           │  your turn                     │  here with      │
│           │                                │  animation]     │
│           │                                │                 │
├───────────┴────────────────────────────────┴─────────────────┤
│  YOUR ABILITIES  (only shown on your turn)                   │
│                                                              │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────┐ │
│ │[icon]    │ │[icon]    │ │[icon]    │ │[icon]    │ │Move│ │
│ │Ironslash │ │Shieldwall│ │War Cry   │ │Thrown    │ │    │ │
│ │2d6+4 dmg │ │+4 AC     │ │AOE taunt │ │Axe       │ │────│ │
│ │ (active) │ │1 turn    │ │15ft cone │ │1d8+3     │ │End │ │
│ │[USE]     │ │[USE]     │ │[USE]     │ │[USE]     │ │Turn│ │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Initiative bar (top):**
- Horizontal strip showing all combatants in order
- Active combatant has gold ring, white name
- Enemies shown in red, players in class-color
- Completed turns are slightly muted

**Enemy panel (left):**
- Lists all enemy entities with HP bars
- Click `[Target]` to select that enemy as your attack target
- Mousing over an enemy shows their status effects
- HP bars turn orange below 50%, red below 25%

**Ability cards (bottom strip):**
- Only YOUR cards shown; other players' cards are hidden
- On your turn cards become interactive (glow border, pointer cursor)
- Off-turn cards are locked (greyed, no click)
- Each card shows: icon, name, short effect summary, dice notation
- Cooldown overlay on used abilities (turn counter)
- `Move` button opens a movement range overlay on the map
- `End Turn` button is always visible on the right

**Dice roll display:**
- When any roll happens, a 3D-style die animates in the top-right corner of the combat log for 1.5s, then settles on the result
- The log entry records the full breakdown: `Ironslash: 2d6(4,3)+4 = 11 vs AC 13 — HIT`

---

## 13. Persistent UI Components (Both Views)

### 13.1 Menu Modal  `[Menu ≡]`

Slide-in panel from the right at 320px wide:

```
┌─────────────────────────────────────────┐
│  Menu                             [✕]   │
│                                         │
│  CHARACTER                              │
│  [Kaelia Dawnwhisper portrait]          │
│  Pathfinder · Level 3                   │
│  ❤ HP: 28 / 40    ✦ Ether: 6 / 8      │
│                                         │
│  [View Full Chronicler →]               │
│                                         │
│  ─── Inventory ────────────────────    │
│  [slot] Iron Sword      equipped        │
│  [slot] Leather Cloak   equipped        │
│  [slot] Health Draught  ×3              │
│                                         │
│  ─── Settings ─────────────────────    │
│  [Keybindings]  [Audio]  [Graphics]     │
│                                         │
│  [Leave Session]                        │
└─────────────────────────────────────────┘
```

### 13.2 Chronicler Sheet (Character Sheet)

Full-screen modal overlay:

```
┌──────────────────────────────────────────────────────────────┐
│  CHRONICLER SHEET                                    [Close] │
├───────────────────────┬──────────────────────────────────────┤
│  [Character portrait] │  Kaelia Dawnwhisper                  │
│                       │  Pathfinder · Origin: Coastal        │
│                       │  Level 3 · XP 1450 / 2700            │
│                       │                                      │
│                       │  ─ Echo Scores ─────────────────     │
│                       │  Force  +2   Grace   +5              │
│                       │  Mind   +3   Presence +1             │
│                       │  Ether  +4   Endurance+2             │
├───────────────────────┴──────────────────────────────────────┤
│  BINDINGS (Abilities)                                        │
│                                                              │
│  [icon] Shadowstep     Passive: move through difficult terr. │
│  [icon] Eagle Eye      Active:  reveal a hidden area         │
│  [icon] Twin Fang      Active:  2 quick melee strikes        │
│  [icon] Smoke Veil     Active:  create a blinding cloud      │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  INVENTORY                    EQUIPMENT                      │
│  [grid of item slots]         [paper doll silhouette]        │
└──────────────────────────────────────────────────────────────┘
```

### 13.3 Chat Panel

Slide-in from right, layered behind the Menu:
- Tabs: `[Party]` `[GM]` `[OOC]`
- OOC = out-of-character (styled differently, grey background)
- GM messages in gold text
- Player messages in their class color

### 13.4 Toast Notifications

Top-center, stack up to 3, auto-dismiss at 4s:
```
┌──────────────────────────────────┐
│ ✦ Kaelia gained 150 XP           │  ← gold, slide in from top
└──────────────────────────────────┘
┌──────────────────────────────────┐
│ ⚔ Combat has begun               │  ← red pulse border
└──────────────────────────────────┘
```

---

## 14. Billing & Payment Flow

Payments are per-chronicle. The GM pays to activate a chronicle (not per-session). Players join for free.

### 14.1 Pricing Modal

Triggered when GM clicks `[Start Chronicle]` at end of builder:

```
┌───────────────────────────────────────────────────┐
│  Activate Your Chronicle                    [✕]   │
│                                                   │
│  The Iron Coast is ready.                         │
│                                                   │
│  ┌─────────────┐  ┌─────────────┐                │
│  │  STANDARD   │  │   EPIC      │                │
│  │             │  │             │                │
│  │  $4.99/mo   │  │  $9.99/mo   │                │
│  │             │  │             │                │
│  │  Up to 4    │  │  Up to 8    │                │
│  │  players    │  │  players    │                │
│  │             │  │             │                │
│  │  AI scenes  │  │  AI scenes  │                │
│  │  + bestiary │  │  + custom   │                │
│  │             │  │  portraits  │                │
│  │  [Select]   │  │  [Select]   │                │
│  └─────────────┘  └─────────────┘                │
│                                                   │
│  [Proceed to payment →]                           │
│                                                   │
│  ℹ Players always join free.                      │
└───────────────────────────────────────────────────┘
```

Payment handled via Stripe. GM manages billing from `/gm/settings`.

---

## 15. AI Prompting Panel — Reusable Component

Used during Chronicle Builder and during live sessions (GM adds encounters, NPCs). Consistent design everywhere.

```
┌──────────────────────────────────────────────────────────────┐
│  [context label e.g. "Generate Encounter"]                   │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Describe what you want...                             │  │
│  │                                                        │  │
│  │  e.g. "A pack of shadow wolves ambushing the party     │  │
│  │  from the trees, led by a corrupted alpha."            │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Modifiers:  [Difficulty ▼]  [Count ▼]  [Environment ▼]    │
│                                                              │
│  Image reference:  [+ Upload]  (optional)                   │
│                                                              │
│  ────────────────────────────────────────────────────────   │
│                                                              │
│  [▶ Generate]                         [Cancel]              │
│                                                              │
│  ─── Result ────────────────────────────────────────────    │
│  [Generated enemy stat block / scene / NPC shown here]      │
│                                                              │
│  [↺ Regenerate]   [✓ Use This]   [Edit manually]            │
└──────────────────────────────────────────────────────────────┘
```

---

## 16. Responsive Behavior

This is primarily a desktop-first app. Tablets are supported in a degraded mode. Mobile is not supported for active play (too small for map interaction), but the Join + Lobby screens work on mobile.

| Breakpoint | Behavior |
|---|---|
| `≥1280px` | Full layout as designed above |
| `1024–1279px` | Narration panel auto-collapses to a toggle button; hotbar wraps to 2 rows |
| `768–1023px` | Tablet: map takes full width, panels overlay as drawers |
| `<768px` | Join/Lobby only; in-game shows "Please use a larger screen" banner |

---

## 17. Accessibility

- All interactive elements reachable by keyboard tab order
- Focus ring: 2px solid `#A07EE8` offset 2px
- Minimum contrast ratio: 4.5:1 for body text, 3:1 for large headings
- Dice roll animation respects `prefers-reduced-motion`
- All game icons have `aria-label`; decorative images use `aria-hidden`

---

## 18. Animation & Transitions

| Event | Animation |
|---|---|
| Entering combat | Vignette flash red → grid lines draw onto map (0.6s) |
| Leaving combat | Grid fades out → soft white flash (0.4s) |
| Character movement | 8-frame sprite walk cycle, smooth lerp between tiles |
| Veil reveal | Tiles fade from black at 0.3s ease-out |
| Ability use | Icon flashes white, cooldown countdown sweeps clockwise |
| HP damage | HP bar shakes, number floats up in red and fades |
| HP heal | Green number floats up, brief green pulse on portrait |
| Toast appear | Slide down from top, ease-out 200ms |
| Toast dismiss | Fade out 200ms |
| AI generating | Pulsing purple shimmer on the output area |

---

## 19. Tech Stack (to be implemented)

| Layer | Choice |
|---|---|
| Frontend | React + Vite (existing `echo-vtt-ui/`) |
| Styling | Tailwind CSS v4 + custom CSS variables for the color tokens |
| State | Zustand for client state, React Query for server state |
| Real-time | WebSockets (Socket.io) for live player positions, combat turns |
| Map rendering | HTML5 Canvas (PixiJS) inside a React component |
| Backend | FastAPI (Python, extending existing `echo-vtt/` core) |
| AI / Generation | Claude API for text; DALL-E 3 or Stability AI for images |
| Auth | Clerk or Supabase Auth |
| Payments | Stripe |
| DB | PostgreSQL (Supabase) |
| Hosting | Vercel (frontend) + Fly.io (backend) |
