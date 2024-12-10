var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { PlaceCache } from '../models/PlaceCache.js';
import { connectDB } from './mongodb.js';
const CACHE_EXPIRY_DAYS = 180; // 180 days
export function getPlacesData(options) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield connectDB();
            console.log(`Searching for places with keyword: "${options.keyword}" in location: "${options.location}"`);
            // Check cache first
            const cachedData = yield PlaceCache.findOne({
                keyword: options.keyword.toLowerCase(),
                location: options.location.toLowerCase(),
            });
            if (cachedData) {
                console.log('Cache hit! Returning cached data');
                // Check if cache is still valid
                const cacheAge = (Date.now() - cachedData.createdAt.getTime()) / (1000 * 60 * 60 * 24); // age in days
                if (cacheAge < CACHE_EXPIRY_DAYS) {
                    return cachedData.data;
                }
                console.log('Cache expired, fetching fresh data');
                yield PlaceCache.deleteOne({ _id: cachedData._id });
            }
            else {
                console.log('Cache miss, fetching from Google Places API');
            }
            // If not in cache or expired, fetch from Google Places API
            const response = yield fetchFromGooglePlaces(options);
            // Cache the results
            try {
                yield PlaceCache.create({
                    placeId: `${options.keyword.toLowerCase()}-${options.location.toLowerCase()}`,
                    data: response,
                    keyword: options.keyword.toLowerCase(),
                    location: options.location.toLowerCase(),
                    createdAt: new Date(),
                });
                console.log('Successfully cached the results');
            }
            catch (cacheError) {
                console.error('Error caching results:', cacheError);
                // Don't throw here - we still want to return the response even if caching fails
            }
            return response;
        }
        catch (error) {
            console.error('Error in getPlacesData:', error);
            if (error instanceof Error) {
                console.error('Error details:', {
                    message: error.message,
                    stack: error.stack,
                });
            }
            throw error;
        }
    });
}
function fetchFromGooglePlaces(options) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { keyword, location } = options;
        const apiKey = process.env.NEXT_GOOGLE_PLACES_API_KEY;
        if (!apiKey) {
            throw new Error('Google Places API key is not configured');
        }
        try {
            const searchQuery = encodeURIComponent(`${keyword} in ${location}`);
            const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${searchQuery}&key=${apiKey}`;
            console.log('Fetching data from Google Places API...');
            const response = yield fetch(url);
            const data = yield response.json();
            if (!response.ok) {
                throw new Error(`Google Places API error: ${data.error_message || 'Unknown error'}`);
            }
            if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
                throw new Error(`Google Places API returned status: ${data.status}`);
            }
            console.log(`Successfully fetched ${((_a = data.results) === null || _a === void 0 ? void 0 : _a.length) || 0} results from Google Places API`);
            return data;
        }
        catch (error) {
            console.error('Error fetching from Google Places API:', error);
            throw error;
        }
    });
}
