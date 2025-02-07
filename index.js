const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "6d31c0a67d1cba3ab08ac3c4d610b0ae";

function convertDateFormat(dateString){
    const [year, month, day] = dateString.split("-");
    return `${day} - ${month} - ${year}`;
}
const createWeatherCard = (cityName, weatherItem, index) => {
    if (index === 0) { // HTML for the main weather card
        return `
        <div class="details">
            <h2>${cityName} | ${convertDateFormat(weatherItem.dt_txt.split(" ")[0])} (Today)</h2>
            <h6>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
            <h6>Wind: ${weatherItem.wind.speed} m/s</h6>
            <h6>Humidity: ${weatherItem.main.humidity}%</h6>
        </div>
        <div class="icon">
            <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
            <h6>${weatherItem.weather[0].description}</h6>
        </div>`;
    } else { // HTML for the other five-day forecast card
        return `
        <li class="card">
            <h3>${convertDateFormat(weatherItem.dt_txt.split(" ")[0]).substring(0, 7)}</h3>
            <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
            <h6>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
            <h6>Wind: ${weatherItem.wind.speed} m/s</h6>
            <h6>Humidity: ${weatherItem.main.humidity}%</h6>
        </li>`;
    }
}

const getWeatherDetails = (cityName, latitude, longitude) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;
    fetch(WEATHER_API_URL).then(response => response.json()).then (data =>{
        const uniqueForecastDays =[];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
                uniqueForecastDays.push(forecastDate);
                return true;  // Correctly returns a boolean
            }
            return false;
        });
        cityInput.value= "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";

        fiveDaysForecast.forEach((weatherItem, index)=> {
            const html = createWeatherCard(cityName, weatherItem, index);
            if (index === 0){
                currentWeatherDiv.insertAdjacentHTML("beforeend", html);
            } else {
                weatherCardsDiv.insertAdjacentHTML("beforeend", html);
            }
        });
    }).catch(() => {
        alert("An error occured while fetching the weather forecast!");
    })
}
const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (!cityName) return alert("Please enter a city name!");

    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    // Fetch coordinates from API
    fetch(API_URL)
        .then(response => {
            if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
            return response.json();
        })
        .then(data => {
            if (!Array.isArray(data) || data.length === 0) {
                return alert(`No coordinates found for "${cityName}". Try another city.`);
            }

            const { lat, lon, name } = data[0];
            getWeatherDetails(name, lat, lon);
        })
        .catch(error => {
            console.error("Error fetching coordinates:", error);
            alert("Failed to retrieve location. Please check your internet connection and try again.");
        });
};
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e=> e.key === "Enter" && getCityCoordinates());
