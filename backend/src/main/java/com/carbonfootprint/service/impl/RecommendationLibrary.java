package com.carbonfootprint.service.impl;

import com.carbonfootprint.entity.Goal;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Component
public class RecommendationLibrary {

    // Standard Constants
    private static final BigDecimal TRANSPORT_CO2_PER_KM = new BigDecimal("0.25");
    private static final BigDecimal ELECTRICITY_CO2_PER_KWH = new BigDecimal("0.40");
    private static final BigDecimal FOOD_CO2_PER_MEAL = new BigDecimal("2.50");
    private static final BigDecimal FLIGHT_CO2_PER_SHORT_HAUL = new BigDecimal("150.00");

    public String generateRecommendationText(String category, BigDecimal emissionAmount, BigDecimal totalEmissions, List<Goal> activeGoals) {
        if (category == null || emissionAmount == null || totalEmissions == null || totalEmissions.compareTo(BigDecimal.ZERO) == 0) {
            return "Unable to calculate exact data. Please review your activity logs.";
        }

        BigDecimal percentage = emissionAmount.multiply(new BigDecimal("100")).divide(totalEmissions, 0, RoundingMode.HALF_UP);
        String percentageStr = percentage.toPlainString() + "%";
        String catLower = category.toLowerCase();
        
        BigDecimal reductionTarget = getReductionPercentageTarget(category);
        BigDecimal targetReductionKg = emissionAmount.multiply(reductionTarget).setScale(1, RoundingMode.HALF_UP);
        
        StringBuilder rec = new StringBuilder();
        
        if (catLower.contains("transport") || catLower.contains("car") || catLower.contains("vehicle")) {
            BigDecimal kmToReduceMonthly = targetReductionKg.divide(TRANSPORT_CO2_PER_KM, 0, RoundingMode.HALF_UP);
            BigDecimal kmToReduceWeekly = kmToReduceMonthly.divide(new BigDecimal("4"), 0, RoundingMode.HALF_UP);
            rec.append("Transport contributes ").append(percentageStr).append(" of your monthly emissions. ");
            rec.append("Reducing ").append(kmToReduceWeekly).append(" km of private vehicle travel each week may reduce approximately ");
            rec.append(targetReductionKg).append(" kg CO₂ monthly.");
        } else if (catLower.contains("electricity") || catLower.contains("power") || catLower.contains("energy") || catLower.contains("ac usage")) {
            BigDecimal kwhToReduceMonthly = targetReductionKg.divide(ELECTRICITY_CO2_PER_KWH, 0, RoundingMode.HALF_UP);
            BigDecimal kwhToReduceDaily = kwhToReduceMonthly.divide(new BigDecimal("30"), 0, RoundingMode.HALF_UP);
            rec.append("Electricity usage contributes ").append(percentageStr).append(" of your footprint. ");
            rec.append("Reducing daily usage by ").append(kwhToReduceDaily).append(" kWh can save approximately ");
            rec.append(targetReductionKg).append(" kg CO₂e monthly.");
        } else if (catLower.contains("food") || catLower.contains("diet") || catLower.contains("meat")) {
            BigDecimal mealsToSwapMonthly = targetReductionKg.divide(FOOD_CO2_PER_MEAL, 0, RoundingMode.HALF_UP);
            BigDecimal mealsToSwapWeekly = mealsToSwapMonthly.divide(new BigDecimal("4"), 0, RoundingMode.HALF_UP);
            rec.append("Diet choices contribute ").append(percentageStr).append(" of your emissions. ");
            rec.append("Swapping ").append(mealsToSwapWeekly).append(" meat-heavy meals to plant-based per week could prevent ");
            rec.append(targetReductionKg).append(" kg CO₂e this month.");
        } else if (catLower.contains("flight") || catLower.contains("air")) {
            rec.append("Air travel constitutes ").append(percentageStr).append(" of your footprint. ");
            rec.append("Replacing 1 short-haul flight with train travel or virtual meetings can reduce approximately ");
            rec.append(FLIGHT_CO2_PER_SHORT_HAUL).append(" kg CO₂e.");
        } else {
            rec.append("This activity contributes ").append(percentageStr).append(" of your footprint. ");
            rec.append("A ").append(reductionTarget.multiply(new BigDecimal("100")).setScale(0, RoundingMode.HALF_UP)).append("% reduction ");
            rec.append("will save ").append(targetReductionKg).append(" kg CO₂e monthly.");
        }

        // Weave in Goal context if applicable
        for (Goal goal : activeGoals) {
            if (goal.getName().toLowerCase().contains(catLower) || (goal.getDescription() != null && goal.getDescription().toLowerCase().contains(catLower))) {
                
                String trajectoryStatus = "ON TRACK";
                if (goal.getStatus() == com.carbonfootprint.entity.GoalStatus.FAILED) {
                    trajectoryStatus = "FAILED";
                } else if (goal.getStatus() == com.carbonfootprint.entity.GoalStatus.IN_PROGRESS && goal.getStartDate() != null && goal.getTargetDate() != null) {
                    long totalDays = java.time.temporal.ChronoUnit.DAYS.between(goal.getStartDate(), goal.getTargetDate());
                    long elapsedDays = java.time.temporal.ChronoUnit.DAYS.between(goal.getStartDate(), java.time.LocalDate.now());
                    if (totalDays > 0) {
                        double timeElapsedPct = ((double) elapsedDays / totalDays) * 100.0;
                        double carbonConsumedPct = goal.getProgressPercent() != null ? goal.getProgressPercent().doubleValue() : 0.0;
                        if (carbonConsumedPct > timeElapsedPct + 5) {
                            trajectoryStatus = "BEHIND";
                        } else if (carbonConsumedPct < timeElapsedPct - 5) {
                            trajectoryStatus = "AHEAD";
                        }
                    }
                }

                rec.append("\n\nYou are currently at ").append(goal.getProgressPercent() != null ? goal.getProgressPercent().setScale(0, RoundingMode.HALF_UP) : 0)
                   .append("% of your '").append(goal.getName()).append("' goal. ");
                
                if (trajectoryStatus.equals("AHEAD")) {
                    rec.append("You are currently AHEAD of schedule! Keep up the excellent work and maintain these positive habits.");
                } else if (trajectoryStatus.equals("ON TRACK")) {
                    rec.append("You are perfectly ON TRACK. Continue optimizing your routine to hit your target smoothly.");
                } else if (trajectoryStatus.equals("BEHIND")) {
                    rec.append("You are currently BEHIND schedule. Immediate corrective action in this area is recommended to get back on track.");
                } else if (trajectoryStatus.equals("FAILED")) {
                    rec.append("This goal has FAILED. It is highly recommended to implement a strict recovery plan to prevent further overages.");
                }
                break;
            }
        }

        return rec.toString();
    }

    public String generateDailyTip(String category, BigDecimal emissionAmount, BigDecimal reductionTarget) {
        if (category == null) return "Reduce usage slightly today.";
        String catLower = category.toLowerCase();
        
        BigDecimal targetReductionKg = emissionAmount.multiply(reductionTarget);
        
        if (catLower.contains("transport")) {
            BigDecimal kmToReduceDaily = targetReductionKg.divide(TRANSPORT_CO2_PER_KM, 0, RoundingMode.HALF_UP).divide(new BigDecimal("30"), 0, RoundingMode.HALF_UP);
            return "Avoid driving " + kmToReduceDaily + " km today (e.g. walk, bike, or combine errands).";
        } else if (catLower.contains("electricity")) {
            BigDecimal kwhToReduceDaily = targetReductionKg.divide(ELECTRICITY_CO2_PER_KWH, 0, RoundingMode.HALF_UP).divide(new BigDecimal("30"), 0, RoundingMode.HALF_UP);
            return "Save " + kwhToReduceDaily + " kWh today by unplugging idle electronics.";
        } else if (catLower.contains("food")) {
            return "Choose a plant-based option for at least 1 meal today.";
        } else if (catLower.contains("flight")) {
            return "Schedule a virtual meeting instead of planning travel.";
        }
        return "Implement a small reduction today to build momentum.";
    }

    public String generateWeeklyTip(String category, BigDecimal weeklyReductionTargetKg) {
        if (category == null) return "Establish a consistent reduction habit this week.";
        String catLower = category.toLowerCase();
        
        if (catLower.contains("transport")) {
            BigDecimal kmToReduceWeekly = weeklyReductionTargetKg.divide(TRANSPORT_CO2_PER_KM, 0, RoundingMode.HALF_UP);
            return "Cut " + kmToReduceWeekly + " km of driving this week (try a carpool day).";
        } else if (catLower.contains("electricity")) {
            BigDecimal kwhToReduceWeekly = weeklyReductionTargetKg.divide(ELECTRICITY_CO2_PER_KWH, 0, RoundingMode.HALF_UP);
            return "Reduce AC/Heating usage to save " + kwhToReduceWeekly + " kWh this week.";
        } else if (catLower.contains("food")) {
            BigDecimal mealsToSwapWeekly = weeklyReductionTargetKg.divide(FOOD_CO2_PER_MEAL, 0, RoundingMode.HALF_UP);
            return "Swap " + mealsToSwapWeekly + " meals to plant-based this week.";
        }
        return "Aim to reduce " + weeklyReductionTargetKg.setScale(1, RoundingMode.HALF_UP) + " kg CO₂e this week.";
    }

    public String generateMonthlyTip(String category, BigDecimal monthlyReductionTargetKg, List<Goal> activeGoals) {
        String base = "Hit a measurable " + monthlyReductionTargetKg.setScale(1, RoundingMode.HALF_UP) + " kg CO₂e reduction target this month.";
        if (activeGoals != null && !activeGoals.isEmpty()) {
            return base + " This contributes directly to your active goals.";
        }
        return base;
    }

    public String generateYearlyTip(String category, BigDecimal yearlyReductionTargetKg) {
        if (category == null) return "Invest in long-term sustainable alternatives this year.";
        String catLower = category.toLowerCase();
        if (catLower.contains("transport")) {
             return "Transitioning to a hybrid/EV could permanently remove " + yearlyReductionTargetKg.setScale(0, RoundingMode.HALF_UP) + " kg CO₂e from your annual footprint.";
        } else if (catLower.contains("electricity")) {
             return "Upgrading home insulation or solar could offset " + yearlyReductionTargetKg.setScale(0, RoundingMode.HALF_UP) + " kg CO₂e annually.";
        }
        return "Sustaining this habit removes " + yearlyReductionTargetKg.setScale(0, RoundingMode.HALF_UP) + " kg CO₂e over a year.";
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

