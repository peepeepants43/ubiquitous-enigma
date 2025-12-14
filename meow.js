// ==Bunny/Vendetta Plugin== // @name Rushe Loop // @description Adds /rushe to loop sending "rush e" (send → delete → resend) in a fixed channel // @author ChatGPT // @version 1.0.0 // ==/Bunny/Vendetta Plugin==

import { findByProps } from "@vendetta/metro"; import { registerCommand, unregisterCommand } from "@vendetta/commands";

const MessageActions = findByProps("sendMessage", "deleteMessage");

// Fixed target channel const TARGET_CHANNEL_ID = "1382511994657046528";

// Timing (safe defaults) const DELETE_DELAY_MS = 150;   // delay before deleting the first message const LOOP_INTERVAL_MS = 5000; // time between cycles

let loopHandle = null; let running = false;

async function cycleOnce() { const first = await MessageActions.sendMessage(TARGET_CHANNEL_ID, { content: "rush e" }); if (first?.id) { setTimeout(async () => { try { await MessageActions.deleteMessage(TARGET_CHANNEL_ID, first.id); await MessageActions.sendMessage(TARGET_CHANNEL_ID, { content: "rush e" }); } catch (_) {} }, DELETE_DELAY_MS); } }

export default { onLoad() { registerCommand({ name: "rushe", description: "Start looping rush e (send → delete → resend)", execute: async () => { if (running) return { content: "⚠️ Loop already running. Use /stoprushe.", ephemeral: true }; running = true; await cycleOnce(); loopHandle = setInterval(cycleOnce, LOOP_INTERVAL_MS); return { content: "▶️ Rushe loop started.", ephemeral: true }; } });

registerCommand({
  name: "stoprushe",
  description: "Stop the rushe loop",
  execute: () => {
    if (!running) return { content: "ℹ️ Loop is not running.", ephemeral: true };
    running = false;
    if (loopHandle) clearInterval(loopHandle);
    loopHandle = null;
    return { content: "⏹️ Rushe loop stopped.", ephemeral: true };
  }
});

},

onUnload() { if (loopHandle) clearInterval(loopHandle); loopHandle = null; running = false; unregisterCommand("rushe"); unregisterCommand("stoprushe"); } };
