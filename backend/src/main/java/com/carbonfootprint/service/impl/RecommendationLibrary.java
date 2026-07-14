package com.carbonfootprint.service.impl;

import org.springframework.stereotype.Component;
import java.util.Arrays;
import java.util.List;

@Component
public class RecommendationLibrary {

    public String generateRecommendationText(String category) {
        if (category == null) {
            return generateCategorySpecificAdvice();
        }

        String catLower = category.toLowerCase();

        if (catLower.contains("transport") || catLower.contains("car travel") || catLower.contains("vehicle")) {
            return String.join("\n", Arrays.asList(
                    "- Use Public Transport",
                    "- Car Pool",
                    "- Walk Short Distances",
                    "- Cycle When Possible"
            ));
        } else if (catLower.contains("electricity") || catLower.contains("ac usage") || catLower.contains("power")) {
            return String.join("\n", Arrays.asList(
                    "- Increase Temperature Setting",
                    "- Use Energy Efficient Devices",
                    "- Reduce Idle Consumption"
            ));
        } else if (catLower.contains("food") || catLower.contains("red meat") || catLower.contains("diet")) {
            return String.join("\n", Arrays.asList(
                    "- Reduce Red Meat Consumption",
                    "- Choose Plant Based Meals",
                    "- Balance Weekly Diet"
            ));
        } else if (catLower.contains("shopping") || catLower.contains("purchases")) {
            return String.join("\n", Arrays.asList(
                    "- Buy Durable Products",
                    "- Reduce Impulse Purchases",
                    "- Reuse Existing Products"
            ));
        } else {
            return generateCategorySpecificAdvice();
        }
    }

    private String generateCategorySpecificAdvice() {
        return "- Review this activity for specific potential efficiency improvements\n- Consider alternative low-carbon options\n- Track the frequency to identify patterns";
    }

    public java.math.BigDecimal getReductionPercentageTarget(String category) {
        if (category == null) return new java.math.BigDecimal("0.05");

        String catLower = category.toLowerCase();
        if (catLower.contains("transport") || catLower.contains("car travel") || catLower.contains("vehicle")) {
            return new java.math.BigDecimal("0.20");
        } else if (catLower.contains("electricity") || catLower.contains("ac usage") || catLower.contains("power")) {
            return new java.math.BigDecimal("0.15");
        } else if (catLower.contains("food") || catLower.contains("red meat") || catLower.contains("diet")) {
            return new java.math.BigDecimal("0.10");
        } else if (catLower.contains("shopping") || catLower.contains("purchases")) {
            return new java.math.BigDecimal("0.05");
        } else {
            return new java.math.BigDecimal("0.05");
        }
    }
}

