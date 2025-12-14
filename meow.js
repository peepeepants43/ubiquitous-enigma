import definePlugin from "@utils/types";
import { findByProps } from "@metro/filters";
import { registerCommand, unregisterCommand } from "@ui/commands";

// --- CONFIGURATION ---
const TARGET_CHANNEL_ID = "1382511994657046528";
const RUSH_E_MESSAGE = "Rush E";

// Internal Discord modules
const MessageActions = findByProps("sendMessage", "editMessage");
const DeletedMessageActions = findByProps("deleteMessage"); 

export default definePlugin({
    name: "RushESenderLoop",
    description: "Registers /rushe to perform the 'send, delete, send again' flash sequence every time it's used.",
    authors: [{ name: "Gemini", id: 0 }], 

    onLoad: () => {
        
        this.command = {
            name: "rushe",
            description: "Performs the 'Rush E' flash-and-send sequence.",
            
            execute: async (args, context) => {
                
                // No more checks, the command runs every time.
                try {
                    // --- PHASE 1: Send (Flash) ---
                    const sentMessage = await MessageActions.sendMessage(
                        TARGET_CHANNEL_ID,
                        { 
                            content: RUSH_E_MESSAGE,
                        }
                    );
                    
                    // Small delay to ensure the message is visible briefly and processed by the client
                    await new Promise(resolve => setTimeout(resolve, 500)); 

                    // --- PHASE 2: Delete (Flash) ---
                    await DeletedMessageActions.deleteMessage(
                        TARGET_CHANNEL_ID,
                        sentMessage.id, 
                        false
                    );
                    
                    // Another small delay before the final, permanent send
                    await new Promise(resolve => setTimeout(resolve, 500)); 

                    // --- PHASE 3: Send Again (Permanent) ---
                    await MessageActions.sendMessage(
                        TARGET_CHANNEL_ID,
                        { 
                            content: RUSH_E_MESSAGE,
                        }
                    );
                    
                    // 4. Success Response
                    return {
                        result: `Successfully completed the 'Rush E' sequence in channel ID ${TARGET_CHANNEL_ID}.`,
                        success: true,
                        ephemeral: true,
                    };
                    
                } catch (error) {
                    return {
                        result: `Operation failed during the sequence: ${error.message}`,
                        success: false,
                        ephemeral: true,
                    };
                }
            },
        };

        registerCommand(this.command);
    },

    onUnload: () => {
        unregisterCommand("rushe");
    },
});
