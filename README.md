# Fuel Focus - Calorie Tracking App

A comprehensive calorie tracking application with AI-powered nutritional recommendations.

## Features

- **Food Search**: Search for any food item and get detailed nutritional information
- **Meal Logging**: Log your daily meals and track total calories and nutrients consumed
- **AI-Powered Recommendations**: Get intelligent healthier alternatives and recipe suggestions using Google Gemini AI
- **Exercise Recommendations**: See how much exercise is needed to burn the calories from your food
- **Nutritional Charts**: Visual representation of nutritional values
- **Daily Summary**: Track your daily intake with detailed breakdowns

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Gemini AI API Key

To enable AI-powered food recommendations:

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Open `src/utils/geminiService.js`
4. Replace the API key with your actual key:

```javascript
const GEMINI_API_KEY = 'your_actual_api_key_here';
```

**Note**: The app uses the official Google Generative AI SDK for reliable AI integration.

### 3. Start Development Server

```bash
npm run dev
```

## How to Use

### Food Search
1. Enter any food item in the search bar
2. Click "Find calories" to get nutritional information
3. View detailed nutritional breakdown and exercise recommendations
4. Add the food to your meal log with custom quantities

### AI Recommendations
- After searching for food, the app automatically generates AI-powered healthier alternatives
- Recommendations are based on the nutritional profile of your searched food
- Includes both simple alternatives and complete recipes
- Shows estimated calories, protein, carbs, and fat for each recommendation

### Meal Logging
1. Search for foods and add them to your meal log
2. Switch to the "Meal Log" tab to view your daily summary
3. See total calories, protein, carbs, fat, and other nutrients consumed
4. Remove individual meals or clear the entire log as needed

## Technologies Used

- **React**: Frontend framework
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **Chart.js**: Data visualization
- **Google Generative AI SDK**: Official Gemini AI integration
- **Calorie Ninjas API**: Nutritional data

## API Keys Required

- **Calorie Ninjas API**: Already configured in the app
- **Google Gemini AI**: Required for AI recommendations (see setup instructions above)

## Features in Detail

### AI-Powered Recommendations
The app uses Google Gemini AI to analyze the nutritional profile of searched foods and provide intelligent alternatives. The AI considers:
- Calorie content
- Protein levels
- Sugar content
- Fat content
- Fiber content
- Current dietary best practices

### Meal Tracking
- Persistent storage using localStorage
- Real-time calculation of daily totals
- Detailed nutrient breakdown
- Quantity tracking for accurate calorie counting

### Exercise Recommendations
Shows how much time is needed for various exercises to burn the calories from your food:
- Jogging
- Power Yoga
- Brisk Walking
- Gym Workout
- Cycling
- Cardio

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is licensed under the MIT License.

