// Groq AI Service for Food Recommendations
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export const generateFoodRecommendations = async (searchedFood, nutritionalData) => {
    try {
        console.log('Starting Groq AI recommendation generation for:', searchedFood);

        const prompt = `You are an expert nutritionist. The user searched for "${searchedFood}" which has per 100g: Calories: ${nutritionalData.calories}, Protein: ${nutritionalData.protein_g}g, Carbs: ${nutritionalData.carbohydrates_total_g}g, Fat: ${nutritionalData.fat_total_g}g, Sugar: ${nutritionalData.sugar_g}g, Sodium: ${nutritionalData.sodium_mg}mg.

Generate exactly 6 healthier food alternatives (NO recipes, only simple whole foods or common food items). Include options relevant to Indian cuisine.

Each object must have: name (string), calories (number), protein (number), carbs (number), fat (number), description (string - why this is healthier than ${searchedFood}), healthTip (string - a short practical health tip about this food, e.g. "Best eaten in the morning for sustained energy").

Respond ONLY with the JSON array. No markdown, no explanation. Start with [ and end with ].`;

        console.log('Sending prompt to Groq...');
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.2,
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Groq API error ${response.status}: ${errorData}`);
        }

        const data = await response.json();
        const text = data.choices[0].message.content;
        console.log('Raw Groq response:', text);

        const parsed = JSON.parse(text);
        // Handle if Groq wraps the array in an object
        const recommendations = Array.isArray(parsed) ? parsed : parsed.recommendations || parsed.alternatives || Object.values(parsed)[0];
        console.log('Parsed recommendations:', recommendations);
        return recommendations;

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
            { name: 'Greek Yogurt with Berries', calories: 120, protein: 15, carbs: 12, fat: 2, description: 'High protein, low calorie alternative', healthTip: 'Great as a post-workout snack to aid muscle recovery.' },
            { name: 'Grilled Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, description: 'Lean protein option', healthTip: 'Pair with vegetables for a balanced, filling meal.' }
        );
    }

    if (isHighSugar) {
        recommendations.push(
            { name: 'Fresh Fruit Salad', calories: 80, protein: 1, carbs: 20, fat: 0, description: 'Natural sweetness without added sugar', healthTip: 'Eat before 4 PM for best sugar metabolism.' },
            { name: 'Nuts and Seeds Mix', calories: 160, protein: 6, carbs: 8, fat: 14, description: 'Healthy fats and protein', healthTip: 'A small handful (30g) is the ideal portion size.' }
        );
    }

    if (isLowProtein) {
        recommendations.push(
            { name: 'Paneer (Cottage Cheese)', calories: 265, protein: 18, carbs: 1, fat: 20, description: 'High protein vegetarian option', healthTip: 'Opt for low-fat paneer to reduce saturated fat intake.' },
            { name: 'Boiled Eggs', calories: 155, protein: 13, carbs: 1, fat: 11, description: 'Complete protein source', healthTip: 'Two eggs a day provide essential amino acids and vitamin D.' }
        );
    }

    const generalHealthy = [
        { name: 'Mixed Green Salad', calories: 50, protein: 3, carbs: 8, fat: 1, description: 'Low calorie, high fiber option', healthTip: 'Add a squeeze of lemon for better iron absorption.' },
        { name: 'Sprouts (Moong)', calories: 30, protein: 3, carbs: 4, fat: 0.2, description: 'Nutrient-dense Indian superfood', healthTip: 'Sprouting increases nutrient bioavailability by up to 30%.' },
        { name: 'Banana', calories: 89, protein: 1, carbs: 23, fat: 0.3, description: 'Natural energy booster', healthTip: 'Best eaten 30 minutes before a workout for quick energy.' },
        { name: 'Roasted Chickpeas', calories: 120, protein: 7, carbs: 20, fat: 3, description: 'Crunchy high-fiber snack', healthTip: 'Season with chaat masala for a tasty low-calorie snack.' },
        { name: 'Curd (Dahi)', calories: 60, protein: 3, carbs: 5, fat: 3, description: 'Probiotic-rich dairy option', healthTip: 'Eat with meals to improve digestion and gut health.' },
        { name: 'Sweet Potato', calories: 86, protein: 2, carbs: 20, fat: 0.1, description: 'Complex carb with low glycemic index', healthTip: 'Bake or boil instead of frying to retain nutrients.' }
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