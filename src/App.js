import React, { useState } from "react";
import axios from "axios";

function App() {
  const [cityName, setCityName] = useState("");
  const [weatherData, setWeatherData] = useState(null);

  const API_KEY = "ca38f13e9d5e9efa93a6fce9e1a40945"; // Replace with your OpenWeatherMap API key

  const createWeatherCard = (weatherItem, index) => {
    if (index === 0) {
      return (
        <div className="details" key={index}>
          <h2>
            {cityName} ({weatherItem.dt_txt.split(" ")[0]})
          </h2>
          <h6>Temperature: {(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
          <h6>Wind: {weatherItem.wind.speed} M/S</h6>
          <h6>Humidity: {weatherItem.main.humidity}%</h6>
        </div>
      );
    } else {
      return (
        <li className="card" key={index}>
          <h3>({weatherItem.dt_txt.split(" ")[0]})</h3>
          <img
            src={`https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png`}
            alt="weather-icon"
          />
          <h6>Temp: {(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
          <h6>Wind: {weatherItem.wind.speed} M/S</h6>
          <h6>Humidity: {weatherItem.main.humidity}%</h6>
        </li>
      );
    }
  };

  const getWeatherDetails = (latitude, longitude) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

    axios
      .get(WEATHER_API_URL)
      .then((response) => {
        const data = response.data;
        // Filter the forecasts to get only one forecast per day
        const uniqueForecastDays = [];
        // eslint-disable-next-line array-callback-return
        const fiveDaysForecast = data.list.filter((forecast) => {
          const forecastDate = new Date(forecast.dt_txt).getDate();
          if (!uniqueForecastDays.includes(forecastDate)) {
            return uniqueForecastDays.push(forecastDate);
          }
        });

        // Set the weather data
        setWeatherData(fiveDaysForecast);
      })
      .catch(() => {
        alert("An error occurred while fetching the weather forecast!");
      });
  };

  const getCityCoordinates = () => {
    const trimmedCityName = cityName.trim();
    if (trimmedCityName === "") return;

    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${trimmedCityName}&limit=1&appid=${API_KEY}`;

    // Get entered city coordinates (latitude, longitude, and name) from the API response
    axios
      .get(API_URL)
      .then((response) => {
        const data = response.data;
        if (!data.length)
          return alert(`No coordinates found for ${trimmedCityName}`);
        const { lat, lon } = data[0];
        getWeatherDetails(lat, lon);
      })
      .catch(() => {
        alert("An error occurred while fetching the coordinates!");
      });
  };

  const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords; // Get coordinates of user location
        // Get city name from coordinates using reverse geocoding API
        const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
        axios
          .get(API_URL)
          .then((response) => {
            const data = response.data;
            const { name } = data[0];
            setCityName(name);
            getWeatherDetails(latitude, longitude);
          })
          .catch(() => {
            alert("An error occurred while fetching the city name!");
          });
      },
      (error) => {
        // Show alert if user denied the location permission
        if (error.code === error.PERMISSION_DENIED) {
          alert(
            "Geolocation request denied. Please reset location permission to grant access again."
          );
        } else {
          alert("Geolocation request error. Please reset location permission.");
        }
      }
    );
  };

  return (
    <div>
      <h1 className="bg-blue-500 text-white text-center py-4 text-2xl font-semibold">
        Weather Dashboard
      </h1>
      <div className="container mx-auto p-6">
        <div className="weather-input max-w-xl mx-auto text-center">
          <h3 className="mb-2">Enter a City Name</h3>
          <input
            className="border border-gray-300 rounded-md p-2 w-full outline-none"
            type="text"
            placeholder="E.g., New York, London, Tokyo"
            value={cityName}
            onChange={(e) => setCityName(e.target.value)}
          />
          <button
            className="mt-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md cursor-pointer"
            onClick={getCityCoordinates}
          >
            Search
          </button>
          <div className="separator mt-4 mb-4 flex items-center">
            <div className="bg-gray-400 h-px flex-grow mr-2"></div>
            <span className="text-gray-600">or</span>
            <div className="bg-gray-400 h-px flex-grow ml-2"></div>
          </div>
          <button
            className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md cursor-pointer"
            onClick={getUserCoordinates}
          >
            Use Current Location
          </button>
        </div>
        {weatherData && (
          <div className="weather-data mt-8">
            <div className="current-weather bg-blue-500 text-white rounded-md p-4 flex justify-between">
              {weatherData.map((weatherItem, index) => (
                <React.Fragment key={index}>
                  {createWeatherCard(weatherItem, index)}
                </React.Fragment>
              ))}
            </div>
            <div className="days-forecast mt-4">
              <h2 className="text-xl font-semibold mb-2">5-Day Forecast</h2>
              <ul className="weather-cards flex flex-wrap gap-4">
                {weatherData.slice(1).map((weatherItem, index) => (
                  <React.Fragment key={index}>
                    {createWeatherCard(weatherItem, index + 1)}
                  </React.Fragment>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
