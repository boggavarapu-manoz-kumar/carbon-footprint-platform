package com.carbonfootprint.chatbot;

/**
 * Defines all possible data scopes the chatbot context service may retrieve.
 * Only scopes relevant to the current user query are activated — enforcing data minimization.
 */
public enum DataScope {
    FOOTPRINT,
    GOALS,
    GAMIFICATION,
    LEADERBOARD,
    RECOMMENDATIONS,
    PLATFORM_HELP
}
