import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import { generateFoodRecommendations } from '../utils/geminiService';

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

function Main() {
    const [food, setFood] = useState('');
    const [calories, setCalories] = useState(null);
    const [servings, setServings] = useState(null);
    const [nutrients, setNutrients] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searched, setSearched] = useState(false);
    


    // Recommendations state
    const [recommendations, setRecommendations] = useState([]);
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [recommendationsLoading, setRecommendationsLoading] = useState(false);

    const apiKey = 'mNYVhL9EMRyKs9AGoxISPQ==r8YDY5Q0dr548mce';



    const exerciseRates = {
        jog: 10,
        powerYoga: 8,
        briskWalk: 5,
        gymWorkout: 7,
        cycling: 12,
        cardio: 9,
    };

    const calculateDurations = (calories) => {
        return {
            jog: (calories / exerciseRates.jog).toFixed(0),
            powerYoga: (calories / exerciseRates.powerYoga).toFixed(0),
            briskWalk: (calories / exerciseRates.briskWalk).toFixed(0),
            gymWorkout: (calories / exerciseRates.gymWorkout).toFixed(0),
            cycling: (calories / exerciseRates.cycling).toFixed(0),
            cardio: (calories / exerciseRates.cardio).toFixed(0),
        };
    };

    const generateRecommendationsWithGemini = async (searchedFood, nutritionalData) => {
        console.log('Starting recommendation generation for:', searchedFood);
        setRecommendationsLoading(true);
        
        // Set a timeout to show fallback recommendations if AI takes too long
        const timeoutId = setTimeout(() => {
            console.log('AI recommendation timeout, showing fallback');
            setRecommendationsLoading(false);
            setShowRecommendations(true);
        }, 10000); // 10 second timeout
        
        try {
            const recommendations = await generateFoodRecommendations(searchedFood, nutritionalData);
            clearTimeout(timeoutId); // Clear timeout if we get a response
            console.log('Received recommendations:', recommendations);
            setRecommendations(recommendations);
            setShowRecommendations(true);
            console.log('Set showRecommendations to true');
        } catch (error) {
            clearTimeout(timeoutId); // Clear timeout on error
            console.error('Error generating recommendations:', error);
            // Fallback recommendations will be handled by the service
            setRecommendations([]);
            setShowRecommendations(true); // Show the section even with empty recommendations
        } finally {
            setRecommendationsLoading(false);
            console.log('Set recommendationsLoading to false');
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSearched(true);
        setShowRecommendations(false);

        try {
            const response = await fetch(
                `https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(food)}`,
                {
                    method: 'GET',
                    headers: { 'X-Api-Key': apiKey },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch calorie data');
            }

            const result = await response.json();
            if (result.items.length > 0) {
                const foodItem = result.items[0];
                setCalories(foodItem.calories);
                setServings(foodItem.serving_size_g);
                setNutrients(foodItem);
                
                // Generate AI-powered recommendations
                generateRecommendationsWithGemini(food, foodItem);
            } else {
                setCalories(null);
                setServings(null);
                setNutrients(null);
                setError('No data found for the entered query.');
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };



    const exerciseDurations = calories ? calculateDurations(calories) : {};

    // Data for Nutritional Values Bar Chart
    const nutrientData = nutrients
        ? {
            labels: [
                'Carbohydrates (g)',
                'Cholesterol (mg)',
                'Saturated Fat (g)',
                'Total Fat (g)',
                'Fiber (g)',
                'Potassium (mg)',
                'Protein (g)',
                'Sodium (mg)',
                'Sugar (g)',
            ],
            datasets: [
                {
                    label: 'Nutritional Values',
                    data: [
                        nutrients.carbohydrates_total_g,
                        nutrients.cholesterol_mg / 1000,
                        nutrients.fat_saturated_g,
                        nutrients.fat_total_g,
                        nutrients.fiber_g,
                        nutrients.potassium_mg / 1000,
                        nutrients.protein_g,
                        nutrients.sodium_mg / 1000,
                        nutrients.sugar_g,
                    ],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(255, 159, 64, 0.6)',
                        'rgba(255, 205, 86, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
                        'rgba(201, 203, 207, 0.6)',
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                    ],
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                },
            ],
        }
        : {};

    return (
        <div className="min-h-screen bg-green-50 p-10 flex flex-col items-center">
            {/* Main Heading */}
            <div className="text-center mb-12">
                <h1 className="text-6xl font-extrabold text-green-900 mb-4">Fuel Focus</h1>
                <p className="text-lg font-semibold text-black max-w-4xl mx-auto">
                    Welcome to Fuel Focus, your ultimate companion for tracking and understanding the nutritional value of your food.
                    Our platform offers an easy way to find out the calorie content and detailed nutritional information of various
                    food items. With our intuitive search tool, you can quickly discover how many calories are in your favorite foods
                    and get personalized recommendations on how to balance your intake through different exercises. Start exploring
                    now to fuel your health and fitness journey with accurate and insightful data.
                </p>
            </div>



            {/* Search Section */}
            <div className="w-full max-w-4xl mb-12">
                        <form onSubmit={handleSearch} className="text-black flex flex-col md:flex-row items-center gap-4">
                            <input
                                type="text"
                                placeholder=" Search for calories in your food..."
                                className="input input-bordered w-full md:w-3/4 rounded-l-lg p-4 shadow-lg bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-400"
                                value={food}
                                onChange={(e) => setFood(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-green-700 transition-colors duration-300"
                            >
                                {loading ? 'Loading...' : 'Find calories'}
                            </button>
                        </form>

                        {/* Error Handling */}
                        {error && (
                            <div className="mt-6 text-center text-red-600">
                                <p className="text-lg">{error}</p>
                            </div>
                        )}

                        {/* Display Results */}
                        {searched && food && calories !== null && (
                            <div className="mt-6 text-center">
                                <h2 className="text-3xl font-semibold text-black">
                                    {food} has a total of <span className="font-bold text-black">{calories} Calories</span>
                                </h2>
                                

                            </div>
                        )}
                    </div>

                    {/* AI-Powered Recommendations Section */}
                    {(recommendationsLoading || showRecommendations) && (
                        <div className="w-full max-w-6xl mb-8">
                            <div className="bg-white shadow-lg p-8 rounded-lg">
                                <h2 className="text-3xl font-bold mb-6 text-black">Healthier Alternatives & Recipes</h2>
                                <p className="text-gray-600 mb-6">Based on your search for "{food}", here are some intelligent recommendations:</p>
                                
                                {recommendationsLoading ? (
                                    <div className="text-center py-16">
                                        <div className="max-w-lg mx-auto">
                                            {/* Main Loading Animation */}
                                            <div className="flex justify-center mb-6">
                                                <div className="relative">
                                                    <div className="w-20 h-20 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-2xl">⚡</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Loading Text */}
                                            <h3 className="text-2xl font-bold text-gray-800 mb-3">Your recommendations are loading...</h3>
                                            <p className="text-gray-600 mb-6 text-lg">Analyzing the nutritional profile of "{food}" to suggest healthier alternatives</p>
                                            
                                            {/* Progress Bar */}
                                            <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                                                <div className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full animate-pulse" style={{width: '70%'}}></div>
                                            </div>
                                            
                                            {/* Animated Dots */}
                                            <div className="flex justify-center space-x-3 mb-6">
                                                <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce"></div>
                                                <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                                <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                                            </div>
                                            
                                            {/* Loading Steps */}
                                            <div className="mt-8 text-sm text-gray-500">
                                                <div className="flex items-center justify-center mb-2">
                                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                                    <span>Analyzing nutritional data...</span>
                                                </div>
                                                <div className="flex items-center justify-center mb-2">
                                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                                    <span>Generating healthier alternatives...</span>
                                                </div>
                                                <div className="flex items-center justify-center">
                                                    <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                                                    <span>Preparing recommendations...</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : recommendations.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {recommendations.map((rec, index) => (
                                            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-300">
                                                <div className="flex items-start justify-between mb-3">
                                                    <h3 className="text-lg font-semibold text-black">{rec.name}</h3>
                                                    {rec.isRecipe && (
                                                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">Recipe</span>
                                                    )}
                                                </div>
                                                
                                                {rec.isRecipe ? (
                                                    <div>
                                                        <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                                                        <div className="text-sm text-gray-700 mb-2">
                                                            <span className="font-semibold">Ingredients:</span>
                                                            <ul className="mt-1 ml-4 list-disc">
                                                                {rec.ingredients && rec.ingredients.map((ingredient, i) => (
                                                                    <li key={i}>{ingredient}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                        <div className="flex justify-between text-xs text-gray-500">
                                                            <span>⏱️ {rec.prepTime}</span>
                                                            <span>📊 {rec.difficulty}</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                                                        <div className="grid grid-cols-3 gap-2 text-xs">
                                                            <div className="text-center p-2 bg-green-100 rounded">
                                                                <span className="font-semibold text-green-800">{rec.calories}</span>
                                                                <div className="text-green-600">cal</div>
                                                            </div>
                                                            <div className="text-center p-2 bg-blue-100 rounded">
                                                                <span className="font-semibold text-blue-800">{rec.protein}g</span>
                                                                <div className="text-blue-600">protein</div>
                                                            </div>
                                                            <div className="text-center p-2 bg-yellow-100 rounded">
                                                                <span className="font-semibold text-yellow-800">{rec.carbs}g</span>
                                                                <div className="text-yellow-600">carbs</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-lg text-gray-600">No recommendations available. This might be due to an API issue or the food item doesn't have suitable alternatives.</p>
                                        <p className="text-sm text-gray-500 mt-2">Debug info: showRecommendations={showRecommendations.toString()}, recommendations.length={recommendations.length}</p>
                                    </div>
                                )}
                                
                                <div className="mt-6 text-center">
                                    <p className="text-xs text-gray-400">
                                        Recommendations based on nutritional analysis and dietary guidelines
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Nutritional Values Section */}
                    {nutrients && (
                        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white shadow-lg p-8 rounded-lg">
                                <h2 className="text-3xl font-bold mb-6 text-black">Nutritional Values</h2>
                                <table className="table-auto w-full border-collapse">
                                    <thead>
                                        <tr>
                                            <th className="text-center py-3 px-4 border-b-2 border-gray-300 text-black">Nutrients</th>
                                            <th className="text-center py-3 px-4 border-b-2 border-gray-300 text-black">Value (per 100 grams)</th>
                                        </tr>
                                    </thead>
                                    <tbody className='text-center'>
                                        <tr>
                                            <td className="py-3 px-4 border-b text-black">Carbohydrates:</td>
                                            <td className="py-3 px-4 border-b text-black">{nutrients.carbohydrates_total_g} g</td>
                                        </tr>
                                        <tr>
                                            <td className="py-3 px-4 border-b text-black">Cholesterol:</td>
                                            <td className="py-3 px-4 border-b text-black">{nutrients.cholesterol_mg} mg</td>
                                        </tr>
                                        <tr>
                                            <td className="py-3 px-4 border-b text-black">Saturated Fat:</td>
                                            <td className="py-3 px-4 border-b text-black">{nutrients.fat_saturated_g} g</td>
                                        </tr>
                                        <tr>
                                            <td className="py-3 px-4 border-b text-black">Total Fat:</td>
                                            <td className="py-3 px-4 border-b text-black">{nutrients.fat_total_g} g</td>
                                        </tr>
                                        <tr>
                                            <td className="py-3 px-4 border-b text-black">Fiber:</td>
                                            <td className="py-3 px-4 border-b text-black">{nutrients.fiber_g} g</td>
                                        </tr>
                                        <tr>
                                            <td className="py-3 px-4 border-b text-black">Potassium:</td>
                                            <td className="py-3 px-4 border-b text-black">{nutrients.potassium_mg} mg</td>
                                        </tr>
                                        <tr>
                                            <td className="py-3 px-4 border-b text-black">Protein:</td>
                                            <td className="py-3 px-4 border-b text-black">{nutrients.protein_g} g</td>
                                        </tr>
                                        <tr>
                                            <td className="py-3 px-4 border-b text-black">Sodium:</td>
                                            <td className="py-3 px-4 border-b text-black">{nutrients.sodium_mg} mg</td>
                                        </tr>
                                        <tr>
                                            <td className="py-3 px-4 border-b text-black">Sugar:</td>
                                            <td className="py-3 px-4 border-b text-black">{nutrients.sugar_g} g</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Exercise Durations Section */}
                            <div className="bg-white shadow-lg p-8 rounded-lg">
                                <h2 className="text-3xl font-bold mb-6 text-black">
                                    To Burn {calories} calories, approximately you will have to:
                                </h2>

                                <ul className="space-y-6">
                                    <li className="flex items-center space-x-4 text-black">
                                        <img
                                            src="https://cdn-icons-png.flaticon.com/512/5147/5147006.png"
                                            alt="Jog"
                                            className="w-14 h-14"
                                        />
                                        <span className="text-lg">Jog for <strong>{exerciseDurations.jog} minutes</strong></span>
                                    </li>
                                    <li className="flex items-center space-x-4 text-black">
                                        <img
                                            src="https://cdn-icons-png.flaticon.com/512/6138/6138024.png"
                                            alt="Power Yoga"
                                            className="w-14 h-14"
                                        />
                                        <span className="text-lg">Do Power Yoga for <strong>{exerciseDurations.powerYoga} minutes</strong></span>
                                    </li>
                                    <li className="flex items-center space-x-4 text-black">
                                        <img
                                            src="https://cdn-icons-png.flaticon.com/512/5147/5147283.png"
                                            alt="Brisk Walk"
                                            className="w-14 h-14"
                                        />
                                        <span className="text-lg">Brisk walk for <strong>{exerciseDurations.briskWalk} minutes</strong></span>
                                    </li>
                                    <li className="flex items-center space-x-4 text-black">
                                        <img
                                            src="https://t3.ftcdn.net/jpg/02/47/12/98/360_F_247129862_Bi60hL0FQfVlGo1XebTeHTvnucTmbXxc.jpg"
                                            alt="Gym Workout"
                                            className="w-14 h-14"
                                        />
                                        <span className="text-lg">Lift weights for <strong>{exerciseDurations.gymWorkout} minutes</strong></span>
                                    </li>
                                    <li className="flex items-center space-x-4 text-black">
                                        <img
                                            src="https://cdn-icons-png.flaticon.com/512/3600/3600996.png"
                                            alt="Cycling"
                                            className="w-14 h-14"
                                        />
                                        <span className="text-lg">Cycle for <strong>{exerciseDurations.cycling} minutes</strong></span>
                                    </li>
                                    <li className="flex items-center space-x-4 text-black">
                                        <img
                                            src="https://cdn-icons-png.flaticon.com/512/1546/1546175.png"
                                            alt="Cardio"
                                            className="w-14 h-14"
                                        />
                                        <span className="text-lg">Do Cardio for <strong>{exerciseDurations.cardio} minutes</strong></span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Bar Chart Section */}
                    {nutrients && (
                        <div className="w-full max-w-4xl mt-8 px-4 sm:px-6 lg:px-8">
                            <div className="bg-white shadow-lg p-4 sm:p-6 lg:p-8 rounded-lg hidden lg:block">
                                <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-black">Nutritional Chart</h2>
                                <div>
                                    <Bar
                                        data={nutrientData}
                                        options={{
                                            responsive: true,
                                            plugins: {
                                                legend: {
                                                    position: 'top',
                                                },
                                                title: {
                                                    display: true,
                                                    text: 'Nutritional Values (per 100 grams)',
                                                },
                                            },
                                            scales: {
                                                y: {
                                                    beginAtZero: true,
                                                },
                                            },
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {searched && food && !loading && !error && (
                        <div className="font-semibold mt-12 text-center text-black">
                            <p className="text-lg">
                                Thank you for using Fuel Focus! Your commitment to understanding nutritional values is a great step towards a healthier lifestyle. Keep tracking and stay motivated!
                            </p>
                        </div>
                    )}

            <p className="text-black mt-12 text-center">Copyright © {new Date().getFullYear()} Fuel Focus - All Rights Reserved.</p>
        </div>
    );
}

export default Main;