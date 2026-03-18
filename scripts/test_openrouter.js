import { generateKundaliAnalysis } from '../server/services/aiService.js';

async function testOpenRouter() {
    console.log("Testing OpenRouter Integration...");
    
    const mockPlanets = [
        { name: "Sun", house: 1, sign: "Aries" },
        { name: "Moon", house: 4, sign: "Cancer" }
    ];
    
    const mockBirthDetails = {
        datetime: "1990-01-01T12:00:00",
        latitude: 18.5204,
        longitude: 73.8567
    };
    
    try {
        const analysis = await generateKundaliAnalysis(mockPlanets, mockBirthDetails);
        console.log("✅ Analysis Received successfully:");
        console.log(JSON.stringify(analysis, null, 2));
    } catch (error) {
        console.error("❌ Analysis Failed:");
        console.error(error.message);
    }
}

testOpenRouter();
