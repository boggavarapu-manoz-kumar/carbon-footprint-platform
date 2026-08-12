package com.carbonfootprint.chatbot;

import org.springframework.stereotype.Component;

/**
 * Static in-memory Knowledge Repository for RAG.
 * Contains the official platform documentation to ground the AI.
 */
@Component
public class PlatformKnowledgeRepository {

    public String getOfficialDocumentation() {
        return """
            --- OFFICIAL PLATFORM KNOWLEDGE BASE ---
            
            1. ACTIVITY CATEGORIES & TYPES:
            - TRANSPORT: Commuting (driving, bus, train), Flights (short/long haul).
            - ENERGY: Electricity, Heating, Cooling.
            - FOOD: Diet choices (Vegan, Vegetarian, Meat-heavy).
            - PURCHASES: Electronics, Clothing, Goods.
            
            2. GOALS:
            - Users can set reduction goals. 
            - Goals have a Target Value (kg CO2) and Target Date.
            - Status can be ACTIVE, COMPLETED, FAILED.
            - "On Track" means current emissions are pacing below the required trajectory.
            
            3. GAMIFICATION (BADGES & POINTS):
            - Points are earned by logging activities (5 pts), achieving goals (50 pts), and maintaining streaks.
            - Streaks increase when activities are logged on consecutive days.
            - Badges: "First Log", "Eco Warrior" (10 activities in a week), "Goal Crusher", "Streak Master" (7 days).
            - Levels: Novice (0-100 pts), Apprentice (101-500 pts), Pro (501-1500 pts), Master (1501+ pts).
            
            4. LEADERBOARDS:
            - Ranks users on a Global scope based on lowest carbon emission per capita or highest points.
            ----------------------------------------
            """;
    }
}
