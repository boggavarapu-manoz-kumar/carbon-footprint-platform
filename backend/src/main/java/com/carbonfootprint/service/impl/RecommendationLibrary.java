package com.carbonfootprint.service.impl;

import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
public class RecommendationLibrary {

    public String generateRecommendationText(String category, BigDecimal emissionAmount) {
        if (category == null) {
            return "- Identify specific low-carbon alternatives for this activity.\n- Set a target to reduce this emission source by 10% next month.\n- Track your frequency closely to find hidden optimization opportunities.";
        }

        String catLower = category.toLowerCase();
        List<String> recommendations = new ArrayList<>();
        
        String emissionStr = (emissionAmount != null) ? emissionAmount.setScale(1, java.math.RoundingMode.HALF_UP).toPlainString() + " kg CO₂e" : "unknown amounts";

        recommendations.add("- DATA INSIGHT: You generated " + emissionStr + " from " + category + " over the last 30 days, making it a primary optimization target.");

        boolean isHighEmission = emissionAmount != null && emissionAmount.compareTo(new BigDecimal("100")) > 0;
        boolean isLowEmission = emissionAmount != null && emissionAmount.compareTo(new BigDecimal("20")) < 0;

        if (catLower.contains("flight") || catLower.contains("air")) {
            recommendations.add("- Offset your specific flight emissions by investing in certified carbon removal projects.");
            if (isHighEmission) {
                recommendations.add("- For short-haul trips under 500 miles, consider high-speed rail instead of flying.");
                recommendations.add("- Switch to economy class which significantly reduces your per-passenger carbon footprint compared to business class.");
            }
            recommendations.add("- Pack lighter. Reducing baggage weight decreases overall fuel consumption.");
        } else if (catLower.contains("transport") || catLower.contains("car") || catLower.contains("vehicle") || catLower.contains("travel")) {
            if (isHighEmission) {
                recommendations.add("- Adopt an EV or hybrid vehicle for your daily commute.");
                recommendations.add("- Implement a strict 3-day work-from-home policy to cut commuting emissions by 60%.");
            } else {
                recommendations.add("- Utilize public transit like buses or trains for regular city travel.");
                recommendations.add("- Coordinate carpools with colleagues living in your route.");
            }
            recommendations.add("- Maintain optimal tire pressure to improve fuel efficiency by up to 3%.");
        } else if (catLower.contains("electricity") || catLower.contains("power") || catLower.contains("ac usage") || catLower.contains("energy")) {
            if (isHighEmission) {
                recommendations.add("- Conduct a comprehensive home energy audit to identify major heat leaks.");
                recommendations.add("- Switch your energy provider to a 100% renewable or green energy plan.");
            }
            recommendations.add("- Upgrade to smart thermostats (e.g., Nest, ecobee) to optimize AC/Heating schedules automatically.");
            recommendations.add("- Replace all remaining incandescent or halogen bulbs with LED alternatives.");
            if (!isHighEmission) {
                recommendations.add("- Unplug 'vampire' appliances when not in use.");
            }
        } else if (catLower.contains("food") || catLower.contains("diet") || catLower.contains("meat") || catLower.contains("meal")) {
            if (isHighEmission) {
                recommendations.add("- Commit to 'Meatless Mondays' and gradually increase plant-based meals to 4 days a week.");
                recommendations.add("- Source 50% of your groceries from local farmers' markets to reduce transportation emissions.");
            } else {
                recommendations.add("- Substitute beef with lower-impact proteins like chicken, fish, or lentils.");
            }
            recommendations.add("- Plan meals carefully to reduce food waste, which heavily contributes to methane emissions in landfills.");
        } else if (catLower.contains("shopping") || catLower.contains("purchases") || catLower.contains("clothes")) {
            recommendations.add("- Prioritize buying second-hand or refurbished items before buying new.");
            recommendations.add("- Choose brands with certified sustainable supply chains and transparent ESG reporting.");
            if (isHighEmission) {
                recommendations.add("- Implement a '30-day rule' before making non-essential purchases to reduce impulse buying.");
            }
        } else {
            recommendations.add("- Review this activity for specific potential efficiency improvements.");
            recommendations.add("- Consider alternative low-carbon options.");
            recommendations.add("- Track the frequency to identify patterns.");
        }

        return String.join("\n", recommendations);
    }

    public BigDecimal getReductionPercentageTarget(String category) {
        if (category == null) return new BigDecimal("0.05");

        String catLower = category.toLowerCase();
        if (catLower.contains("flight") || catLower.contains("air")) {
            return new BigDecimal("0.30");
        } else if (catLower.contains("transport") || catLower.contains("car") || catLower.contains("vehicle")) {
            return new BigDecimal("0.25");
        } else if (catLower.contains("electricity") || catLower.contains("power") || catLower.contains("ac usage")) {
            return new BigDecimal("0.20");
        } else if (catLower.contains("food") || catLower.contains("diet") || catLower.contains("meat")) {
            return new BigDecimal("0.15");
        } else if (catLower.contains("shopping") || catLower.contains("purchases")) {
            return new BigDecimal("0.10");
        } else {
            return new BigDecimal("0.05");
        }
    }
}

