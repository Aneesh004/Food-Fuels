// Gemini AI Service for Food Recommendations
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const generateFoodRecommendations = async (searchedFood, nutritionalData) => {
    try {
        console.log('Starting Gemini AI recommendation generation for:', searchedFood);
        console.log('Using API key:', GEMINI_API_KEY ? `${GEMINI_API_KEY.substring(0, 10)}...` : 'MISSING');

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `You are an expert nutritionist. The user searched for "${searchedFood}" which has per 100g: Calories: ${nutritionalData.calories}, Protein: ${nutritionalData.protein_g}g, Carbs: ${nutritionalData.carbohydrates_total_g}g, Fat: ${nutritionalData.fat_total_g}g, Sugar: ${nutritionalData.sugar_g}g, Sodium: ${nutritionalData.sodium_mg}mg.

Generate exactly 6 healthier alternatives as a JSON array. Mix simple foods and recipes. Include Indian cuisine options.

Each object must have: name (string), calories (number), protein (number), carbs (number), fat (number), description (string), isRecipe (boolean), ingredients (array of strings or null), prepTime (string or null), difficulty (string or null).

For non-recipes: ingredients, prepTime, difficulty must be null.
For recipes: provide ingredients (3-5), prepTime, difficulty (Easy/Medium/Hard).`;

        console.log('Sending prompt to Gemini...');
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        console.log('Raw Gemini response:', text);

        const parsed = JSON.parse(text);
        console.log('Parsed recommendations:', parsed);
        return parsed;

    } catch (error) {
        console.error('Error generating recommendations:', error);
        const fallbackRecommendations = getFallbackRecommendations(searchedFood, nutritionalData);
        console.log('Using fallback recommendations:', fallbackRecommendations);
        return fallbackRecommendations;
    }
};

const getFallbackRecommendations = (searchedFood, nutritionalData) => {
    const isHighCalorie = nutritionalData.calories > 300;
    const isHighFat = nutritionalData.fat_total_g > 15;
    const isHighSugar = nutritionalData.sugar_g > 20;
    const isLowProtein = nutritionalData.protein_g < 10;

    let recommendations = [];

    if (isHighCalorie || isHighFat) {
        recommendations.push(
            { name: 'Greek Yogurt with Berries', calories: 120, protein: 15, carbs: 12, fat: 2, description: 'High protein, low calorie alternative', isRecipe: false, ingredients: null, prepTime: null, difficulty: null },
            { name: 'Grilled Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, description: 'Lean protein option', isRecipe: false, ingredients: null, prepTime: null, difficulty: null }
        );
    }

    if (isHighSugar) {
        recommendations.push(
            { name: 'Fresh Fruit Salad', calories: 80, protein: 1, carbs: 20, fat: 0, description: 'Natural sweetness without added sugar', isRecipe: false, ingredients: null, prepTime: null, difficulty: null },
            { name: 'Nuts and Seeds Mix', calories: 160, protein: 6, carbs: 8, fat: 14, description: 'Healthy fats and protein', isRecipe: false, ingredients: null, prepTime: null, difficulty: null }
        );
    }

    if (isLowProtein) {
        recommendations.push(
            { name: 'Tuna Salad', calories: 120, protein: 20, carbs: 2, fat: 4, description: 'High protein option', isRecipe: false, ingredients: null, prepTime: null, difficulty: null },
            { name: 'Cottage Cheese with Pineapple', calories: 100, protein: 12, carbs: 8, fat: 2, description: 'Protein-rich snack', isRecipe: false, ingredients: null, prepTime: null, difficulty: null }
        );
    }

    const generalHealthy = [
        { name: 'Mixed Green Salad', calories: 50, protein: 3, carbs: 8, fat: 1, description: 'Low calorie, high fiber option', isRecipe: false, ingredients: null, prepTime: null, difficulty: null },
        { name: 'Grilled Vegetables', calories: 80, protein: 4, carbs: 12, fat: 3, description: 'Nutrient-rich side dish', isRecipe: false, ingredients: null, prepTime: null, difficulty: null },
        { name: 'Quinoa Bowl', calories: 150, protein: 6, carbs: 25, fat: 3, description: 'Complete protein grain bowl', isRecipe: false, ingredients: null, prepTime: null, difficulty: null },
        { name: 'Lentil Soup (Dal)', calories: 180, protein: 12, carbs: 30, fat: 2, description: 'Indian protein-rich comfort food', isRecipe: true, ingredients: ['Lentils', 'Onions', 'Tomatoes', 'Spices'], prepTime: '30 mins', difficulty: 'Easy' },
        { name: 'Roasted Chickpeas', calories: 120, protein: 7, carbs: 20, fat: 3, description: 'Crunchy high-fiber snack', isRecipe: false, ingredients: null, prepTime: null, difficulty: null },
        { name: 'Steamed Edamame', calories: 110, protein: 10, carbs: 9, fat: 4, description: 'Simple plant-based protein', isRecipe: false, ingredients: null, prepTime: null, difficulty: null }
    ];

    while (recommendations.length < 6) {
        const nextItem = generalHealthy.find(item => !recommendations.some(r => r.name === item.name));
        if (nextItem) {
            recommendations.push(nextItem);
        } else {
            break; 
        }
    }

    return recommendations.slice(0, 6);
};