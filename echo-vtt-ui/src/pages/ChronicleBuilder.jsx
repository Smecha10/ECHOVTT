import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useGameStore } from '../store/gameStore'
import { useUIStore } from '../store/uiStore'
import QuestionChips from '../components/builder/QuestionChips'
import ImageUploadZone from '../components/builder/ImageUploadZone'

const STEPS = ['World', 'Story', 'Factions', 'Scenes', 'Bestiary']

const WORLD_TONES = ['Dark & Gritty', 'High Fantasy', 'Horror', 'Political Intrigue', 'Comedic', 'Mythic', 'Post-Apocalyptic', 'Nautical']
const ERAS = ['Medieval', 'Ancient', 'Renaissance', 'Post-Collapse', 'Timeless']
const MAGIC_STYLES = ['Rare & Mysterious', 'Common & Structured', 'Corrupting', 'Nature-bound', 'Technology-merged']
const CONFLICT_TYPES = ['War between factions', 'Ancient evil awakening', 'Political conspiracy', 'Environmental catastrophe', 'A heist', 'Personal vengeance', 'Cosmic horror', 'Revolution']
const DIFFICULTY = ['Easy', 'Medium', 'Hard', 'Brutal']
const LOOT_STYLES = ['Sparse', 'Moderate', 'Generous', 'Legendary-heavy']
const STAKES = ['Personal', 'Regional', 'World-ending', 'Cosmic']
const FACTION_NAMING = ['Real-world inspired', 'Invented fantasy', 'Symbolic', 'Militaristic']
const STARTING_LOCATIONS = ['Tavern/Inn', 'City Gate', 'Wilderness', 'Prison', 'Ship', 'Ruins', 'Temple', 'Market']
const ENV_HAZARDS = ['Traps', 'Weather', 'Cursed Areas', 'Crumbling Structures', 'Wild Magic Zones']
const EXPLORATION_STYLES = ['Linear', 'Open World', 'Branching Paths', 'Hub-based']
const MINION_TYPES = ['Undead', 'Beasts', 'Humanoid', 'Elemental', 'Constructs', 'Aberrations', 'Spirits', 'Demons']
const ENEMY_TACTICS = ['Mindless swarm', 'Tactical', 'Ambush', 'Defensive', 'Magic-heavy', 'Brute force']

function TextArea({ label, hint, value, onChange, placeholder, rows = 3 }) {
  return (
    <div>
      <label className="echo-label">{label}</label>
      {hint && <p style={{ color: '#4A3F6B', fontSize: 11, margin: '0 0 4px' }}>{hint}</p>}
      <textarea className="echo-textarea" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} />
    </div>
  )
}

export default function ChronicleBuilder() {
  const { chronicleId } = useParams()
  const navigate = useNavigate()
  const { playerId, setChronicle } = useGameStore()
  const addToast = useUIStore((s) => s.addToast)

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState([])

  const [config, setConfig] = useState({
    tone: [], setting_era: '', geography_style: '', magic_style: '', free_text: '',
    geography_description: '', key_locations: '', cultural_details: '', world_secrets: '',
    central_conflict: '', campaign_length: 6, player_agency: 0.7,
    antagonist_description: '', key_npcs: '', plot_twists: '', starting_situation: '', stakes: [],
    num_factions: 3, faction_naming_style: [], faction_relationships: '', player_faction: '', hidden_factions: '', political_landscape: '',
    combat_frequency: 0.5, starting_location: [], scene_atmosphere: '', environmental_hazards: [], points_of_interest: '', exploration_style: [], map_theme: '',
    enemy_variety: 0.5, difficulty_curve: 'Medium', loot_style: 'Moderate',
    enemy_theme: '', boss_concept: '', minion_types: [], loot_description: '', special_rewards: '', enemy_tactics: [],
  })

  const set = (k) => (v) => setConfig((c) => ({ ...c, [k]: v }))

  const generate = async () => {
    setLoading(true)
    try {
      const result = await api.generateChronicle({ chronicle_id: chronicleId, config })
      setChronicle(result.chronicle)
      addToast('Chronicle generated!', 'success')
      navigate(`/gm/session/${chronicleId}`)
    } catch (e) {
      addToast('Generation failed: ' + e.message, 'warning')
    } finally {
      setLoading(false)
    }
  }

  const progressPct = ((step + 1) / STEPS.length) * 100

  return (
    <div style={{ minHeight: '100vh', background: '#0D0F14' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', borderBottom: '1px solid #2A2F3D' }}>
        <span className="font-display" style={{ fontSize: 18, color: '#C9A84C' }}>ECHO VTT · Build Chronicle</span>
        <button className="echo-btn-ghost echo-btn echo-btn-sm" onClick={() => navigate('/gm')}>← Dashboard</button>
      </header>

      {/* Progress */}
      <div style={{ padding: '12px 24px', borderBottom: '1px solid #2A2F3D' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          {STEPS.map((s, i) => (
            <button key={s} onClick={() => setStep(i)}
              style={{ fontSize: 12, padding: '3px 10px', borderRadius: 12, background: i === step ? '#7C5CBF' : i < step ? '#2A2F3D' : 'transparent', color: i === step ? '#fff' : i < step ? '#9A9080' : '#4A3F6B', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              {i < step ? '✓ ' : `${i + 1}. `}{s}
            </button>
          ))}
        </div>
        <div style={{ height: 3, background: '#1B1F2B', borderRadius: 2 }}>
          <div style={{ height: '100%', width: `${progressPct}%`, background: '#7C5CBF', borderRadius: 2, transition: 'width 0.3s' }} />
        </div>
      </div>

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' }}>
        {/* Left: Questions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* ── STEP 0: WORLD ──────────────────────────────────── */}
          {step === 0 && (<>
            <div>
              <h2 className="font-display" style={{ color: '#F5ECD6', fontSize: 20, marginBottom: 4 }}>Shape Your World</h2>
              <p style={{ color: '#9A9080', fontSize: 13 }}>Define the tone, setting, and feel of your chronicle.</p>
            </div>
            <div><label className="echo-label">Tone (pick any)</label>
              <QuestionChips options={WORLD_TONES} selected={config.tone} onChange={set('tone')} /></div>
            <div><label className="echo-label">Era</label>
              <QuestionChips options={ERAS} selected={config.setting_era ? [config.setting_era] : []} onChange={([v]) => set('setting_era')(v)} multi={false} /></div>
            <div><label className="echo-label">Magic Style</label>
              <QuestionChips options={MAGIC_STYLES} selected={config.magic_style ? [config.magic_style] : []} onChange={([v]) => set('magic_style')(v)} multi={false} /></div>
            <TextArea label="Describe your world" hint="Paint the big picture — atmosphere, history, feel" value={config.free_text} onChange={set('free_text')} placeholder="e.g. 'A dying empire at the edge of a cursed sea…'" />
            <TextArea label="Geography & Landscape" hint="Volcanic islands? Frozen tundra? Floating cities?" value={config.geography_description} onChange={set('geography_description')} placeholder="Describe the terrain, biomes, and natural features…" />
            <TextArea label="Key Locations" hint="Name 2-3 important places" value={config.key_locations} onChange={set('key_locations')} placeholder="e.g. 'Duskport — a crumbling harbor city; Ironmere — a haunted fortress…'" />
            <TextArea label="Cultural Details" hint="What makes this world's people unique?" value={config.cultural_details} onChange={set('cultural_details')} placeholder="Customs, religions, languages, social structures…" />
            <TextArea label="🔒 World Secrets (GM only)" hint="Hidden truths players don't know yet" value={config.world_secrets} onChange={set('world_secrets')} placeholder="The gods are dead. Magic is slowly killing the world…" />
            <div><label className="echo-label">Inspiration Images (optional)</label>
              <ImageUploadZone images={images} onImages={setImages} /></div>
          </>)}

          {/* ── STEP 1: STORY ──────────────────────────────────── */}
          {step === 1 && (<>
            <div>
              <h2 className="font-display" style={{ color: '#F5ECD6', fontSize: 20, marginBottom: 4 }}>The Story</h2>
              <p style={{ color: '#9A9080', fontSize: 13 }}>Define the conflict, stakes, and narrative direction.</p>
            </div>
            <div><label className="echo-label">Central Conflict</label>
              <QuestionChips options={CONFLICT_TYPES} selected={config.central_conflict ? [config.central_conflict] : []} onChange={([v]) => set('central_conflict')(v)} multi={false} /></div>
            <div><label className="echo-label">Stakes</label>
              <QuestionChips options={STAKES} selected={config.stakes} onChange={set('stakes')} /></div>
            <TextArea label="Antagonist / Main Threat" hint="Who or what opposes the players?" value={config.antagonist_description} onChange={set('antagonist_description')} placeholder="A fallen king consumed by Veil corruption, desperate to close the tear…" />
            <TextArea label="Key NPCs" hint="Important characters the players will meet" value={config.key_npcs} onChange={set('key_npcs')} placeholder="Mira the merchant, Captain Holt of the Covenant, the Oracle of Dusk…" />
            <TextArea label="Starting Situation" hint="Where do the players begin and why?" value={config.starting_situation} onChange={set('starting_situation')} placeholder="Hired by a mysterious patron at a seaside inn to investigate disappearances…" />
            <TextArea label="🔒 Plot Twists (GM only)" hint="Surprise elements to weave in" value={config.plot_twists} onChange={set('plot_twists')} placeholder="The patron is the villain's lieutenant. The artifact is a decoy…" />
            <div>
              <label className="echo-label">Campaign Length (sessions): {config.campaign_length}</label>
              <input type="range" min={1} max={20} value={config.campaign_length} onChange={(e) => set('campaign_length')(+e.target.value)} style={{ width: '100%', accentColor: '#7C5CBF' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9A9080' }}><span>1 session</span><span>20 sessions</span></div>
            </div>
            <div>
              <label className="echo-label">Player Agency: {Math.round(config.player_agency * 100)}%</label>
              <input type="range" min={0} max={100} value={config.player_agency * 100} onChange={(e) => set('player_agency')(+e.target.value / 100)} style={{ width: '100%', accentColor: '#7C5CBF' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9A9080' }}><span>Railroaded</span><span>Fully Open</span></div>
            </div>
          </>)}

          {/* ── STEP 2: FACTIONS ───────────────────────────────── */}
          {step === 2 && (<>
            <div>
              <h2 className="font-display" style={{ color: '#F5ECD6', fontSize: 20, marginBottom: 4 }}>Factions & Power</h2>
              <p style={{ color: '#9A9080', fontSize: 13 }}>Define the power players and political landscape.</p>
            </div>
            <div>
              <label className="echo-label">Number of Factions: {config.num_factions}</label>
              <input type="range" min={1} max={6} value={config.num_factions} onChange={(e) => set('num_factions')(+e.target.value)} style={{ width: '100%', accentColor: '#7C5CBF' }} />
            </div>
            <div><label className="echo-label">Faction Naming Style</label>
              <QuestionChips options={FACTION_NAMING} selected={config.faction_naming_style} onChange={set('faction_naming_style')} /></div>
            <TextArea label="Faction Relationships" hint="How do factions interact? Alliances, rivalries, trade?" value={config.faction_relationships} onChange={set('faction_relationships')} placeholder="The Covenant and Free Harbor have a tense truce. The Cult operates in secret…" />
            <TextArea label="Player Faction" hint="Do the players belong to or align with a faction?" value={config.player_faction} onChange={set('player_faction')} placeholder="The players are freelancers hired by the Free Harbor…" />
            <TextArea label="Political Landscape" hint="Who holds power and how is it maintained?" value={config.political_landscape} onChange={set('political_landscape')} placeholder="A council of merchant lords rules through wealth. The Covenant enforces law…" />
            <TextArea label="🔒 Hidden Factions (GM only)" hint="Secret organizations the players don't know about" value={config.hidden_factions} onChange={set('hidden_factions')} placeholder="The Veilborn Cult has infiltrated the council…" />
          </>)}

          {/* ── STEP 3: SCENES ─────────────────────────────────── */}
          {step === 3 && (<>
            <div>
              <h2 className="font-display" style={{ color: '#F5ECD6', fontSize: 20, marginBottom: 4 }}>Scenes & Exploration</h2>
              <p style={{ color: '#9A9080', fontSize: 13 }}>Design the spaces players will explore.</p>
            </div>
            <div><label className="echo-label">Starting Location</label>
              <QuestionChips options={STARTING_LOCATIONS} selected={config.starting_location} onChange={set('starting_location')} /></div>
            <div><label className="echo-label">Exploration Style</label>
              <QuestionChips options={EXPLORATION_STYLES} selected={config.exploration_style} onChange={set('exploration_style')} /></div>
            <div><label className="echo-label">Environmental Hazards</label>
              <QuestionChips options={ENV_HAZARDS} selected={config.environmental_hazards} onChange={set('environmental_hazards')} /></div>
            <TextArea label="Scene Atmosphere" hint="Describe the mood and feel of the opening scene" value={config.scene_atmosphere} onChange={set('scene_atmosphere')} placeholder="Dim torchlight, creaking wood, the smell of salt and ale…" />
            <TextArea label="Points of Interest" hint="Notable features, hidden passages, interactive objects" value={config.points_of_interest} onChange={set('points_of_interest')} placeholder="A locked trapdoor behind the bar, a notice board with bounties…" />
            <TextArea label="Map Theme" hint="Describe the visual style you want for the map" value={config.map_theme} onChange={set('map_theme')} placeholder="Weathered stone dungeon with moss, crumbling columns, dim lighting…" />
            <div>
              <label className="echo-label">Combat Frequency: {Math.round(config.combat_frequency * 100)}%</label>
              <input type="range" min={0} max={100} value={config.combat_frequency * 100} onChange={(e) => set('combat_frequency')(+e.target.value / 100)} style={{ width: '100%', accentColor: '#7C5CBF' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9A9080' }}><span>Peaceful</span><span>Constant battle</span></div>
            </div>
          </>)}

          {/* ── STEP 4: BESTIARY ────────────────────────────────── */}
          {step === 4 && (<>
            <div>
              <h2 className="font-display" style={{ color: '#F5ECD6', fontSize: 20, marginBottom: 4 }}>Bestiary, Loot & Rewards</h2>
              <p style={{ color: '#9A9080', fontSize: 13 }}>Define enemies, combat style, and treasure.</p>
            </div>
            <div><label className="echo-label">Difficulty Curve</label>
              <QuestionChips options={DIFFICULTY} selected={[config.difficulty_curve]} onChange={([v]) => set('difficulty_curve')(v)} multi={false} /></div>
            <div><label className="echo-label">Loot Style</label>
              <QuestionChips options={LOOT_STYLES} selected={[config.loot_style]} onChange={([v]) => set('loot_style')(v)} multi={false} /></div>
            <div><label className="echo-label">Minion Types</label>
              <QuestionChips options={MINION_TYPES} selected={config.minion_types} onChange={set('minion_types')} /></div>
            <div><label className="echo-label">Enemy Tactics</label>
              <QuestionChips options={ENEMY_TACTICS} selected={config.enemy_tactics} onChange={set('enemy_tactics')} /></div>
            <TextArea label="Enemy Theme" hint="What kind of creatures inhabit this world?" value={config.enemy_theme} onChange={set('enemy_theme')} placeholder="Corrupted spirits, thrall soldiers, cave-dwelling beasts…" />
            <TextArea label="Boss Concept" hint="Describe the ultimate enemy encounter" value={config.boss_concept} onChange={set('boss_concept')} placeholder="A fallen hero consumed by Veil energy, fights in phases…" />
            <TextArea label="Loot & Treasure" hint="What kind of equipment and valuables exist?" value={config.loot_description} onChange={set('loot_description')} placeholder="Ether-forged weapons, ancient rune stones, enchanted cloaks…" />
            <TextArea label="Special Rewards" hint="Unique items, legendary weapons, story rewards" value={config.special_rewards} onChange={set('special_rewards')} placeholder="The Blade of Echoes — a sword that absorbs enemy abilities…" />
            <div>
              <label className="echo-label">Enemy Variety: {Math.round(config.enemy_variety * 100)}%</label>
              <input type="range" min={0} max={100} value={config.enemy_variety * 100} onChange={(e) => set('enemy_variety')(+e.target.value / 100)} style={{ width: '100%', accentColor: '#7C5CBF' }} />
            </div>
          </>)}
        </div>

        {/* Right: Summary */}
        <div className="echo-panel" style={{ padding: 20, position: 'sticky', top: 24 }}>
          <div style={{ color: '#9A9080', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Chronicle Config</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
            <Row label="Tone" value={config.tone.join(', ') || '—'} />
            <Row label="Era" value={config.setting_era || '—'} />
            <Row label="Magic" value={config.magic_style || '—'} />
            <Row label="Conflict" value={config.central_conflict || '—'} />
            <Row label="Stakes" value={config.stakes.join(', ') || '—'} />
            <Row label="Length" value={`${config.campaign_length} sessions`} />
            <Row label="Factions" value={`${config.num_factions} factions`} />
            <Row label="Start" value={config.starting_location.join(', ') || '—'} />
            <Row label="Explore" value={config.exploration_style.join(', ') || '—'} />
            <Row label="Difficulty" value={config.difficulty_curve} />
            <Row label="Loot" value={config.loot_style} />
            <Row label="Enemies" value={config.minion_types.join(', ') || '—'} />
            <Row label="Tactics" value={config.enemy_tactics.join(', ') || '—'} />
          </div>

          {/* Text field fill indicators */}
          <div style={{ marginTop: 14, borderTop: '1px solid #2A2F3D', paddingTop: 12 }}>
            <div style={{ color: '#9A9080', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Creative Detail</div>
            {[
              ['World', [config.free_text, config.geography_description, config.key_locations, config.cultural_details]],
              ['Story', [config.antagonist_description, config.key_npcs, config.starting_situation]],
              ['Factions', [config.faction_relationships, config.player_faction, config.political_landscape]],
              ['Scenes', [config.scene_atmosphere, config.points_of_interest, config.map_theme]],
              ['Bestiary', [config.enemy_theme, config.boss_concept, config.loot_description, config.special_rewards]],
            ].map(([name, fields]) => {
              const filled = fields.filter(f => f.trim()).length
              const total = fields.length
              return (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ color: '#9A9080', fontSize: 11, width: 56 }}>{name}</span>
                  <div style={{ flex: 1, height: 4, background: '#1B1F2B', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(filled / total) * 100}%`, background: filled === total ? '#27AE60' : '#7C5CBF', borderRadius: 2, transition: 'width 0.3s' }} />
                  </div>
                  <span style={{ fontSize: 10, color: filled === total ? '#27AE60' : '#4A3F6B' }}>{filled}/{total}</span>
                </div>
              )
            })}
          </div>

          <div style={{ marginTop: 16, borderTop: '1px solid #2A2F3D', paddingTop: 16 }}>
            <p style={{ color: '#9A9080', fontSize: 12, marginBottom: 14 }}>
              The AI uses every detail you provide — more text = richer world generation.
            </p>
            {step < STEPS.length - 1 ? (
              <button className="echo-btn" style={{ width: '100%' }} onClick={() => setStep(step + 1)}>
                Next: {STEPS[step + 1]} →
              </button>
            ) : (
              <button className="echo-btn-gold echo-btn" style={{ width: '100%' }} onClick={generate} disabled={loading}>
                {loading ? <span className="ai-generating">Generating your world…</span> : '✦ Generate Chronicle'}
              </button>
            )}
            {step > 0 && (
              <button className="echo-btn-ghost echo-btn" style={{ width: '100%', marginTop: 8 }} onClick={() => setStep(step - 1)}>
                ← Back
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
      <span style={{ color: '#9A9080' }}>{label}</span>
      <span style={{ color: '#E8E0D0', textAlign: 'right', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
    </div>
  )
}
