// Gemini AI Service for Food Recommendations
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = 'AIzaSyAcWtjTh8zu_INjekvYguDIBOVDSosiQ58';

export const generateFoodRecommendations = async (searchedFood, nutritionalData) => {
    try {
        console.log('Starting Gemini AI recommendation generation for:', searchedFood);
        
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = generateGeminiPrompt(searchedFood, nutritionalData);
        console.log('Generated prompt:', prompt);
        
        const geminiResult = await model.generateContent(prompt);
        console.log('Gemini response:', geminiResult);
        
        const geminiText = typeof geminiResult.response.candidates?.[0]?.content?.parts?.[0]?.text === "string"
            ? geminiResult.response.candidates[0].content.parts[0].text
            : typeof geminiResult.response.text === "string"
                ? geminiResult.response.text
                : "";

        console.log('Extracted text:', geminiText);

        if (!geminiText) {
            throw new Error('No response from Gemini AI');
        }
        
        // Extract JSON from the response
        const jsonMatch = geminiText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            const parsedRecommendations = JSON.parse(jsonMatch[0]);
            console.log('Parsed recommendations:', parsedRecommendations);
            return parsedRecommendations;
        } else {
            console.log('No JSON found in response, using fallback');
            throw new Error('Invalid response format from AI');
        }
    } catch (error) {
        console.error('Error generating recommendations:', error);
        // Return fallback recommendations
        const fallbackRecommendations = getFallbackRecommendations(searchedFood, nutritionalData);
        console.log('Using fallback recommendations:', fallbackRecommendations);
        return fallbackRecommendations;
    }
};

const generateGeminiPrompt = (searchedFood, nutritionalData) => {
    return `
    Based on the food "${searchedFood}" with the following nutritional profile:
    - Calories: ${nutritionalData.calories}
    - Protein: ${nutritionalData.protein_g}g
    - Carbohydrates: ${nutritionalData.carbohydrates_total_g}g
    - Total Fat: ${nutritionalData.fat_total_g}g
    - Sugar: ${nutritionalData.sugar_g}g
    - Sodium: ${nutritionalData.sodium_mg}mg
    - Fiber: ${nutritionalData.fiber_g}g

    Please provide 6 healthier alternatives and recipe suggestions. For each recommendation, provide:
    1. A healthier alternative food or recipe name
    2. Estimated calories per serving
    3. Key nutritional benefits
    4. Brief description of why it's healthier
    5. If it's a recipe, include 3-4 main ingredients and prep time

    Format the response as a JSON array with objects containing:
    {
        "name": "Food/Recipe Name",
        "calories": estimated_calories,
        "protein": estimated_protein_g,
        "carbs": estimated_carbs_g,
        "fat": estimated_fat_g,
        "description": "Why this is healthier",
        "isRecipe": true/false,
        "ingredients": ["ingredient1", "ingredient2", "ingredient3"],
        "prepTime": "X minutes",
        "difficulty": "Easy/Medium/Hard"
    }

    Focus on:
    - Lower calorie alternatives
    - Higher protein options
    - Lower sugar alternatives
    - More fiber-rich options
    - Whole food alternatives
    - Plant-based options where applicable
    `;
};

const getFallbackRecommendations = (searchedFood, nutritionalData) => {
    const isHighCalorie = nutritionalData.calories > 300;
    const isHighFat = nutritionalData.fat_total_g > 15;
    const isHighSugar = nutritionalData.sugar_g > 20;
    const isLowProtein = nutritionalData.protein_g < 10;

    const recommendations = [];

    if (isHighCalorie || isHighFat) {
        recommendations.push(
            {
                name: 'Greek Yogurt with Berries',
                calories: 120,
                protein: 15,
                carbs: 12,
                fat: 2,
                description: 'High protein, low calorie alternative',
                isRecipe: false
            },
            {
                name: 'Grilled Chicken Breast',
                calories: 165,
                protein: 31,
                carbs: 0,
                fat: 3.6,
                description: 'Lean protein option',
                isRecipe: false
            }
        );
    }

    if (isHighSugar) {
        recommendations.push(
            {
                name: 'Fresh Fruit Salad',
                calories: 80,
                protein: 1,
                carbs: 20,
                fat: 0,
                description: 'Natural sweetness without added sugar',
                isRecipe: false
            },
            {
                name: 'Nuts and Seeds Mix',
                calories: 160,
                protein: 6,
                carbs: 8,
                fat: 14,
                description: 'Healthy fats and protein',
                isRecipe: false
            }
        );
    }

    if (isLowProtein) {
        recommendations.push(
            {
                name: 'Tuna Salad',
                calories: 120,
                protein: 20,
                carbs: 2,
                fat: 4,
                description: 'High protein option',
                isRecipe: false
            },
            {
                name: 'Cottage Cheese with Pineapple',
                calories: 100,
                protein: 12,
                carbs: 8,
                fat: 2,
                description: 'Protein-rich snack',
                isRecipe: false
            }
        );
    }

    // Add general healthy alternatives if no specific matches
    if (recommendations.length === 0) {
        recommendations.push(
            {
                name: 'Mixed Green Salad',
                calories: 50,
                protein: 3,
                carbs: 8,
                fat: 1,
                description: 'Low calorie, high fiber option',
                isRecipe: false
            },
            {
                name: 'Grilled Vegetables',
                calories: 80,
                protein: 4,
                carbs: 12,
                fat: 3,
                description: 'Nutrient-rich side dish',
                isRecipe: false
            },
            {
                name: 'Quinoa Bowl',
                calories: 150,
                protein: 6,
                carbs: 25,
                fat: 3,
                description: 'Complete protein grain bowl',
                isRecipe: false
            }
        );
    }

    return recommendations.slice(0, 6);
}; 