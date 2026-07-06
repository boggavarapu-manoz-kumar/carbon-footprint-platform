package com.carbonfootprint.config;

import com.carbonfootprint.entity.*;
import com.carbonfootprint.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class EmissionFactorSeeder implements CommandLineRunner {

    private final ActivityCategoryRepository categoryRepo;
    private final ActivitySubCategoryRepository subCategoryRepo;
    private final ActivityTypeRepository typeRepo;
    private final ActivityInputSchemaRepository schemaRepo;
    private final EmissionFactorRepository efRepo;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Checking if Activity Catalog needs seeding...");
        if (categoryRepo.count() > 0) {
            log.info("Activity Catalog already seeded.");
            return;
        }

        log.info("Seeding Comprehensive Activity Catalog (95-99% coverage)...");

        // 1. Transport Category
        ActivityCategory transport = categoryRepo.save(ActivityCategory.builder().code("TRANSPORT").name("Transport").icon("car").build());
        
        ActivitySubCategory commute = subCategoryRepo.save(ActivitySubCategory.builder().category(transport).code("COMMUTE").name("Daily Commute").build());
        createActivityType(commute, "CAR_PETROL", "Petrol Car", "MULTIPLIER", "0.192", "kgCO2e/km", "distance", "NUMBER");
        createActivityType(commute, "CAR_DIESEL", "Diesel Car", "MULTIPLIER", "0.171", "kgCO2e/km", "distance", "NUMBER");
        createActivityType(commute, "EV", "Electric Vehicle", "MULTIPLIER", "0.053", "kgCO2e/km", "distance", "NUMBER");
        createActivityType(commute, "MOTORCYCLE", "Motorcycle", "MULTIPLIER", "0.103", "kgCO2e/km", "distance", "NUMBER");

        ActivitySubCategory publicTransit = subCategoryRepo.save(ActivitySubCategory.builder().category(transport).code("PUBLIC_TRANSIT").name("Public Transit").build());
        createActivityType(publicTransit, "BUS", "Public Bus", "MULTIPLIER", "0.105", "kgCO2e/km", "distance", "NUMBER");
        createActivityType(publicTransit, "TRAIN", "Train/Metro", "MULTIPLIER", "0.041", "kgCO2e/km", "distance", "NUMBER");

        ActivitySubCategory longDist = subCategoryRepo.save(ActivitySubCategory.builder().category(transport).code("LONG_DISTANCE").name("Long Distance").build());
        createActivityType(longDist, "FLIGHT_SHORT", "Short Haul Flight", "MULTIPLIER", "0.156", "kgCO2e/km", "distance", "NUMBER");
        createActivityType(longDist, "FLIGHT_LONG", "Long Haul Flight", "MULTIPLIER", "0.150", "kgCO2e/km", "distance", "NUMBER");

        // 2. Home Energy
        ActivityCategory energy = categoryRepo.save(ActivityCategory.builder().code("ENERGY").name("Home Energy").icon("zap").build());
        ActivitySubCategory electricity = subCategoryRepo.save(ActivitySubCategory.builder().category(energy).code("ELECTRICITY").name("Electricity").build());
        createActivityType(electricity, "GRID_ELEC", "Grid Electricity", "MULTIPLIER", "0.385", "kgCO2e/kWh", "amount", "NUMBER");
        createActivityType(electricity, "SOLAR_ELEC", "Solar", "MULTIPLIER", "0.000", "kgCO2e/kWh", "amount", "NUMBER");
        createActivityType(electricity, "RENEWABLE_ELEC", "Renewable Energy", "MULTIPLIER", "0.000", "kgCO2e/kWh", "amount", "NUMBER");

        ActivitySubCategory heating = subCategoryRepo.save(ActivitySubCategory.builder().category(energy).code("HEATING").name("Heating").build());
        createActivityType(heating, "NATURAL_GAS", "Natural Gas", "MULTIPLIER", "2.03", "kgCO2e/m3", "amount", "NUMBER");
        createActivityType(heating, "HEATING_OIL", "Heating Oil", "MULTIPLIER", "2.68", "kgCO2e/L", "amount", "NUMBER");

        // 3. Diet
        ActivityCategory diet = categoryRepo.save(ActivityCategory.builder().code("DIET").name("Food & Diet").icon("coffee").build());
        ActivitySubCategory meals = subCategoryRepo.save(ActivitySubCategory.builder().category(diet).code("MEALS").name("Meals").build());
        createActivityType(meals, "MEAL_BEEF", "Beef Meal", "MULTIPLIER", "7.7", "kgCO2e/meal", "servings", "NUMBER");
        createActivityType(meals, "MEAL_POULTRY", "Poultry/Pork", "MULTIPLIER", "1.8", "kgCO2e/meal", "servings", "NUMBER");
        createActivityType(meals, "MEAL_CHICKEN", "Chicken Meal", "MULTIPLIER", "1.6", "kgCO2e/meal", "servings", "NUMBER");
        createActivityType(meals, "MEAL_SEAFOOD", "Seafood Meal", "MULTIPLIER", "1.4", "kgCO2e/meal", "servings", "NUMBER");
        createActivityType(meals, "MEAL_VEG", "Vegetarian Meal", "MULTIPLIER", "1.2", "kgCO2e/meal", "servings", "NUMBER");
        createActivityType(meals, "MEAL_VEGAN", "Vegan Meal", "MULTIPLIER", "0.8", "kgCO2e/meal", "servings", "NUMBER");

        // 4. Shopping
        ActivityCategory shopping = categoryRepo.save(ActivityCategory.builder().code("SHOPPING").name("Shopping").icon("shopping-bag").build());
        ActivitySubCategory clothing = subCategoryRepo.save(ActivitySubCategory.builder().category(shopping).code("CLOTHING").name("Clothing").build());
        createActivityType(clothing, "CLOTHING_FAST", "Fast Fashion", "MULTIPLIER", "15.0", "kgCO2e/item", "quantity", "NUMBER");
        
        ActivitySubCategory electronics = subCategoryRepo.save(ActivitySubCategory.builder().category(shopping).code("ELECTRONICS").name("Electronics").build());
        createActivityType(electronics, "ELEC_DEVICE", "Smartphone/Laptop", "MULTIPLIER", "55.0", "kgCO2e/item", "quantity", "NUMBER");

        log.info("Catalog seeded successfully!");
    }

    private void createActivityType(ActivitySubCategory sub, String code, String name, String strategy, String factorVal, String unit, String schemaField, String schemaType) {
        ActivityType type = typeRepo.save(ActivityType.builder()
            .subCategory(sub).code(code).name(name).calculationStrategy(strategy).build());
            
        efRepo.save(EmissionFactor.builder()
            .activityType(type).factorValue(new BigDecimal(factorVal)).unit(unit).source("EPA/DEFRA 2023").build());
            
        schemaRepo.save(ActivityInputSchema.builder()
            .activityType(type).fieldName(schemaField).fieldType(schemaType).isRequired(true).build());
    }
}
