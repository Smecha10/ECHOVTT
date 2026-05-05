import random
from ws.manager import manager
from services.game_engine import engine
from services.ai import get_ai_provider


async def handle_message(session_id: str, player_id: str, data: dict):
    msg_type = data.get("type", "")

    if msg_type == "move":
        entity_id = data.get("entity_id")
        position = data.get("position")
        if not entity_id or position is None:
            return
        if engine.move_entity(session_id, entity_id, position):
            await manager.broadcast(session_id, {
                "type": "entity_moved",
                "entity_id": entity_id,
                "position": position,
            })

    elif msg_type == "use_ability":
        attacker_id = data.get("attacker_id")
        target_id = data.get("target_id")
        ability = data.get("ability", {})
        dice_str = ability.get("dice", "1d6")

        # Attack roll
        attack_roll = random.randint(1, 20)

        # Find target AC
        session = engine.sessions.get(session_id)
        target = next((e for e in (session.entities if session else []) if e["id"] == target_id), None)
        target_ac = target["ac"] if target else 12

        hit = attack_roll >= target_ac or attack_roll == 20
        is_fracture = attack_roll == 20  # critical hit

        result: dict = {
            "type": "ability_result",
            "attacker_id": attacker_id,
            "target_id": target_id,
            "ability_name": ability.get("name", "Attack"),
            "attack_roll": attack_roll,
            "target_ac": target_ac,
            "hit": hit,
            "is_fracture": is_fracture,
            "damage": 0,
            "rolls": [],
        }

        if hit:
            roll_result = engine.roll_dice(dice_str if dice_str else "1d6")
            if is_fracture:
                roll_result["total"] *= 2
            damage = max(1, roll_result["total"])
            result["damage"] = damage
            result["rolls"] = roll_result["rolls"]
            result["modifier"] = roll_result["modifier"]

            updated = engine.apply_damage(session_id, target_id, damage)
            if updated:
                result["target_hp"] = updated["hp"]
                result["target_max_hp"] = updated["max_hp"]
                result["target_alive"] = updated["is_alive"]

        msg = f"{'FRACTURE! ' if is_fracture else ''}{ability.get('name', 'Attack')} → {target['name'] if target else 'target'}: {'HIT' if hit else 'MISS'}"
        if hit:
            msg += f" for {result['damage']} damage"
        engine.log_event(session_id, "combat", msg)

        await manager.broadcast(session_id, result)

    elif msg_type == "end_turn":
        session = engine.sessions.get(session_id)
        if session and session.combat.active:
            next_turn = engine.advance_turn(session_id)
            if next_turn:
                engine.log_event(session_id, "combat", f"Turn: {next_turn.entity_name}")
                await manager.broadcast(session_id, {
                    "type": "turn_changed",
                    "current_turn": next_turn.model_dump(),
                    "round": session.combat.round,
                })

    elif msg_type == "chat":
        text = data.get("text", "").strip()
        channel = data.get("channel", "party")
        if text:
            await manager.broadcast(session_id, {
                "type": "chat_message",
                "player_id": player_id,
                "text": text,
                "channel": channel,
            })

    elif msg_type == "gm_narrate":
        text = data.get("text", "").strip()
        if text:
            event = engine.log_event(session_id, "gm", text)
            await manager.broadcast(session_id, {
                "type": "narration",
                "source": "gm",
                "text": text,
                "event": event,
            })

    elif msg_type == "gm_ai_narrate":
        context = data.get("context", "")
        event_desc = data.get("event", "")
        ai = get_ai_provider()
        text = await ai.generate_narration(context, event_desc)
        logged = engine.log_event(session_id, "narration", text)
        await manager.broadcast(session_id, {
            "type": "narration",
            "source": "ai",
            "text": text,
            "event": logged,
        })

    elif msg_type == "gm_start_combat":
        combatant_ids = data.get("combatant_ids", [])
        if combatant_ids:
            combat_state = engine.start_combat(session_id, combatant_ids)
            engine.log_event(session_id, "system", "⚔ Combat begins!")
            await manager.broadcast(session_id, {
                "type": "combat_started",
                "combat": combat_state.model_dump(),
            })

    elif msg_type == "gm_end_combat":
        engine.end_combat(session_id)
        engine.log_event(session_id, "system", "Combat ended.")
        await manager.broadcast(session_id, {"type": "combat_ended"})

    elif msg_type == "gm_spawn_entity":
        from models.entity import Entity
        entity_data = data.get("entity", {})
        entity = Entity(**entity_data)
        engine.add_entity(session_id, entity)
        engine.log_event(session_id, "system", f"{entity.name} appears!")
        await manager.broadcast(session_id, {
            "type": "entity_spawned",
            "entity": entity.model_dump(),
        })

    elif msg_type == "state_request":
        session = engine.sessions.get(session_id)
        if session:
            scene = engine.get_current_scene(session_id)
            await manager.send_to(session_id, player_id, {
                "type": "state_sync",
                "session": session.model_dump(),
                "scene": scene.model_dump() if scene else None,
            })

    elif msg_type == "ping":
        await manager.send_to(session_id, player_id, {"type": "pong"})
