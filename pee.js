// Bunny / Vendetta plugin // /rushe command (REUSABLE): // Starts a controlled loop that: // 1) Sends "rush e" to a fixed channel // 2) Deletes it shortly after // 3) Sends "rush e" again // Repeats on an interval until /stoprushe is used // Includes safety limits to avoid runaway spam

import { findByProps } from "@vendetta/metro"; import { registerCommand, unregisterCommand } from "@vendetta/commands";

const MessageActions = findByProps("sendMessage", "deleteMessage");

// Fixed target channel const TARGET_CHANNEL_ID = "1382511994657046528";

// Safety config const DELETE_DELAY_MS = 150;      // time before deleting first message const LOOP_INTERVAL_MS = 250;    // minimum delay between cycles (5s)

let loopHandle = null; let running = false;

async function cycleOnce() { // First send const first = await MessageActions.sendMessage(TARGET_CHANNEL_ID, { content: "rush e" });

// Delete then resend if (first?.id) { setTimeout(async () => { try { await MessageActions.deleteMessage(TARGET_CHANNEL_ID, first.id); await MessageActions.sendMessage(TARGET_CHANNEL_ID, { content: "rush e" }); } catch (_) {} }, DELETE_DELAY_MS); } }

export default { onLoad() { registerCommand({ name: "rushe", description: "Start looping ghost send → delete → resend", execute: async () => { if (running) { return { content: "⚠️ rushe loop already running. Use /stoprushe to stop.", ephemeral: true }; }

running = true;
    // Run immediately, then on interval
    await cycleOnce();
    loopHandle = setInterval(cycleOnce, LOOP_INTERVAL_MS);

    return { content: "▶️ rushe loop started. Use /stoprushe to stop.", ephemeral: true };
  }
});

registerCommand({
  name: "stoprushe",
  description: "Stop the rushe loop",
  execute: () => {
    if (!running) {
      return { content: "ℹ️ rushe loop is not running.", ephemeral: true };
    }
    running = false;
    if (loopHandle) clearInterval(loopHandle);
    loopHandle = null;
    return { content: "⏹️ rushe loop stopped.", ephemeral: true };
  }
});

},

onUnload() { if (loopHandle) clearInterval(loopHandle); loopHandle = null; running = false; unregisterCommand("rushe"); unregisterCommand("stoprushe"); } };
