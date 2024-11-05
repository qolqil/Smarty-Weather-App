// script.js
const apiKey = '5397d6112b2a1e36b6051a2dc36e4acc';

const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const weatherInfoDiv = document.getElementById('weather-info');
const weeklyForecastDiv = document.getElementById('weekly-forecast');
const forecastTable = document.getElementById('forecast-table');
const locationBtn = document.getElementById('location-btn');
const dateTimeDiv = document.getElementById('date-time');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const tempToggleBtn = document.getElementById('toggle-temp-unit');
const hourlyForecastDiv = document.getElementById('hourly-forecast');
const hourlySlider = document.getElementById('hourly-slider');
const hourlySliderOutput = document.getElementById('hourly-forecast-slider-output');

let isCelsius = true;
let map;


// Display current date and time
function displayDateTime() {
    const now = new Date();
    dateTimeDiv.innerHTML = now.toLocaleString();
}
setInterval(displayDateTime, 1000);

// Toggle Theme
themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    document.querySelector('.header').classList.toggle('light-theme');
    document.querySelector('.weather-app').classList.toggle('light-theme');
    document.querySelector('.footer').classList.toggle('light-theme');
    const headerTitle = document.querySelector('.header h1');
    const dateTime = document.getElementById('date-time');
    if (document.body.classList.contains('light-theme')) {
        headerTitle.style.color = '#27402c';
        dateTime.style.color = '#27402c';
        hourlySliderOutput.style.color = '#27402c'; // New line added

    } else {
        headerTitle.style.color = '#D0DB97';
        dateTime.style.color = '#D0DB97';
        hourlySliderOutput.style.color = '#D0DB97'; // New line added

    }
});

// Toggle Temperature Unit
tempToggleBtn.addEventListener('click', () => {
    isCelsius = !isCelsius;
    const city = cityInput.value;
    if (city) {
        getWeather(city);
        getWeeklyForecast(city);
        getHourlyForecast(city);
    }
});

// Search City Weather
searchBtn.addEventListener('click', () => {
    const city = cityInput.value;
    if (city) {
        getWeather(city);
        getWeeklyForecast(city);
        getHourlyForecast(city);
        getAstronomyData(city);
    }
});

cityInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const city = cityInput.value;
        if (city) {
            getWeather(city);
            getWeeklyForecast(city);
            getHourlyForecast(city);
            getAstronomyData(city);
        }
    }
});

// Get Location-Based Weather
locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                getWeatherByLocation(latitude, longitude);
                getWeeklyForecastByLocation(latitude, longitude);
                getHourlyForecastByLocation(latitude, longitude);
                getAstronomyDataByLocation(latitude, longitude);
            },
            (error) => {
                console.error('Error getting geolocation:', error.message);
                alert('Unable to retrieve your location. Please check your browser permissions.');
            }
        );
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});

// Weather Data Fetch Functions
async function getWeather(city) {
    try {
        const unit = isCelsius ? 'metric' : 'imperial';
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${unit}`);
        if (!response.ok) {
            throw new Error('City not found');
        }
        const data = await response.json();
        displayWeather(data);
        // Get latitude and longitude for the searched city
        const { lat, lon } = data.coord;

        // Call function to render map
        renderMap(lat, lon, city);

    } catch (error) {
        weatherInfoDiv.innerHTML = '';
    }
}

async function getWeatherByLocation(lat, lon) {
    try {
        const unit = isCelsius ? 'metric' : 'imperial';
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`);
        if (!response.ok) {
            throw new Error('Unable to fetch weather for your location');
        }
        const data = await response.json();
        displayWeather(data);
    } catch (error) {
        weatherInfoDiv.innerHTML = `<p class="error">${error.message}</p>`;
    }
}

// Weekly Forecast Fetch Functions
async function getWeeklyForecast(city) {
    try {
        const unit = isCelsius ? 'metric' : 'imperial';
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${unit}`);
        if (!response.ok) {
            throw new Error('Unable to fetch weekly forecast');
        }
        const data = await response.json();
        displayWeeklyForecast(data);
    } catch (error) {
        weeklyForecastDiv.innerHTML = '';
        forecastTable.innerHTML = '';
    }
}

async function getWeeklyForecastByLocation(lat, lon) {
    try {
        const unit = isCelsius ? 'metric' : 'imperial';
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`);
        if (!response.ok) {
            throw new Error('Unable to fetch weekly forecast for your location');
        }
        const data = await response.json();
        displayWeeklyForecast(data);
    } catch (error) {
        weeklyForecastDiv.innerHTML = `<p class="error">${error.message}</p>`;
    }
}

// Hourly Forecast Fetch Functions
async function getHourlyForecast(city, lat = null, lon = null) {
    try {
        const unit = isCelsius ? 'metric' : 'imperial';
        let response;

        if (lat && lon) {
            response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`);
        } else {
            response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${unit}`);
        }

        if (!response.ok) {
            throw new Error('Unable to fetch hourly forecast');
        }
        const data = await response.json();
        displayHourlyForecastSlider(data);
        displayHourlyForecast(data);
    } catch (error) {
        hourlySliderOutput.innerHTML = `<p class="error">${error.message}</p>`;
    }
}

// Display Functions
function displayWeather(data) {
    const { name, main, weather, wind, sys } = data;
    const tempUnit = isCelsius ? '°C' : '°F';
    weatherInfoDiv.innerHTML = `
        <h2>${name}</h2>
        <p>Temperature: ${main.temp} ${tempUnit}</p>
        <p>Humidity: ${main.humidity}%</p>
        <p>Weather: ${weather[0].description}</p>
        <p>Wind: ${wind.speed} ${isCelsius ? 'm/s' : 'mph'} at ${wind.deg}&deg;</p>
        <p>Sunrise: ${new Date(sys.sunrise * 1000).toLocaleTimeString()}</p>
        <p>Sunset: ${new Date(sys.sunset * 1000).toLocaleTimeString()}</p>
    `;
}

function displayWeeklyForecast(data) {
    forecastTable.innerHTML = `
        <tr>
            <th>Date</th>
            <th>Temperature</th>
            <th>Weather</th>
        </tr>
    `;
    data.list.forEach((forecast, index) => {
        if (index % 8 === 0) { // Taking one forecast per day at the same time
            const date = new Date(forecast.dt_txt);
            const iconUrl = getWeatherIcon(forecast.weather[0].description.toLowerCase());
            forecastTable.innerHTML += `
                <tr>
                    <td style="padding: 5px; text-align: center;">${date.toDateString()}</td>
                    <td style="padding: 5px; text-align: center;">
                        <img src="${iconUrl}" alt="${forecast.weather[0].description}" style="width: 30px; height: 30px;"><br>
                        ${forecast.main.temp} ${isCelsius ? '°C' : '°F'}
                    </td>
                    <td style="padding: 5px; text-align: center;">${forecast.weather[0].description}</td>
                </tr>
            `;
        }
    });
}

function displayHourlyForecastSlider(data) {
    let hourlyData = data.list.slice(0, 8); // Taking next 8 hours

    // Set maximum value for the slider based on available hourly data
    hourlySlider.max = hourlyData.length - 1;

    // Initial display for the first hour
    updateHourlyForecastSlider(hourlyData, 0);

    // Event listener for slider movement
    hourlySlider.addEventListener('input', () => {
        const hourIndex = parseInt(hourlySlider.value);
        updateHourlyForecastSlider(hourlyData, hourIndex);
    });
}

function updateHourlyForecastSlider(hourlyData, index) {
    const forecast = hourlyData[index];
    const date = new Date(forecast.dt_txt);
    const iconUrl = getWeatherIcon(forecast.weather[0].description.toLowerCase());

    hourlySliderOutput.innerHTML = `
        <div>
            <h4>${date.getHours()}:00</h4>
            <p>Temperature: ${forecast.main.temp} ${isCelsius ? '°C' : '°F'}</p>
            <p>${forecast.weather[0].description}</p>
        </div>
    `;
}

function displayHourlyForecast(data) {
    let content = '<h3>Hourly Forecast</h3><div class="hourly-forecast-list">';
    data.list.slice(0, 8).forEach(forecast => {
        const date = new Date(forecast.dt_txt);
        const iconUrl = getWeatherIcon(forecast.weather[0].description.toLowerCase());
        content += `
            <div class="hourly-forecast-item">
                <p>${date.getHours()}:00</p>
                <img src="${iconUrl}" alt="${forecast.weather[0].description}" style="width: 40px; height: 40px;">
                <p>${forecast.main.temp} ${isCelsius ? '°C' : '°F'}</p>
            </div>
        `;
    });
    content += '</div>';
    hourlyForecastDiv.innerHTML = content;
}

// Function to render map using Leaflet.js
function renderMap(latitude, longitude, city) {
    // If map already exists, remove it to avoid reinitialization
    if (map) {
        map.remove();
    }

    // Initialize map
    map = L.map('map').setView([latitude, longitude], 12);

    // Add tile layer to map (using OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add marker for the location
    L.marker([latitude, longitude]).addTo(map)
        .bindPopup(`<b>${city}</b><br>Weather Location.`)
        .openPopup();
}



function getWeatherIcon(weatherDescription) {
    switch (weatherDescription) {
        case 'clear sky':
            return 'icons/sunny.png';
        case 'few clouds':
        case 'scattered clouds':
        case 'broken clouds':
            return 'icons/cloudy.png';
        case 'shower rain':
        case 'rain':
            return 'icons/rainy.png';
        case 'thunderstorm':
            return 'icons/stormy.png';
        case 'snow':
            return 'icons/snowy.png';
        case 'mist':
            return 'icons/mist.png';
        default:
            return 'icons/default.png';
    }
}
