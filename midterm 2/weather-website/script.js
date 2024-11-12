const apiKey = "90116c26018dfe643fd1946561ff7a07";
const apiUrl =
  "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const apiForecastUrl =
  "https://api.openweathermap.org/data/2.5/forecast?units=metric&q=";

const city = document.querySelector(".location");
const temp = document.getElementById("current-temp");
const humidity = document.querySelector(".humidity");
const wind = document.querySelector(".wind");
const form = document.querySelector("form");
const input = document.getElementById("city-input");
const weatherIcon = document.getElementById("weather-icon");
const weatherDesc = document.getElementById("weather-desc");
const weatherBox = document.getElementById("current-weather");
const forecastContainer = document.getElementById("forecast-data");
const geoButton = document.getElementById("geo-btn");
const unitToggleButton = document.getElementById("unit-toggle");

let unit = "metric";
let usingGeolocation = false;
let lastSearchedCity = ""; // To store the last searched city name

form.addEventListener("submit", (e) => {
  e.preventDefault();
  suggestionsContainer.style.display = "none";
  if (input.value) {
    lastSearchedCity = input.value; // Save the city name for later
    usingGeolocation = false; // User manually searched for a city
    checkWeather(input.value);
    getForecast(input.value);
    input.value = "";
  }
});

geoButton.addEventListener("click", () => {
  if (navigator.geolocation) {
    usingGeolocation = true; // User is using geolocation
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
  } else {
    alert("Geolocation is not supported by your browser.");
  }
});

unitToggleButton.addEventListener("click", () => {
  // Toggle between 'metric' (Celsius) and 'imperial' (Fahrenheit)
  unit = unit === "metric" ? "imperial" : "metric";
  unitToggleButton.textContent = unit === "metric" ? "F/C" : "C/F";

  if (usingGeolocation) {
    // Refetch weather and forecast for geolocation
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
  } else if (lastSearchedCity) {
    // Refetch weather and forecast for the last searched city
    checkWeather(lastSearchedCity);
    getForecast(lastSearchedCity);
  }
});

async function checkWeather(town) {
  const response = await fetch(apiUrl + town + `&appid=${apiKey}`);
  const data = await response.json();

  if (response.status == 404) {
    document.querySelector(".error").style.display = "block";
    weatherBox.style.display = "none";
  } else {
    // Get the current temperature in Celsius
    let temperature = data.main.temp;

    // If the unit is Fahrenheit, convert the temperature
    if (unit === "imperial") {
      temperature = (temperature * 9) / 5 + 32; // Celsius to Fahrenheit
    }

    city.innerHTML = data.name;
    temp.innerHTML = `${Math.round(temperature)}°${
      unit === "metric" ? "C" : "F"
    }`;
    humidity.innerHTML = data.main.humidity + "%";
    wind.innerHTML = data.wind.speed + " km/h"; // Wind speed remains in km/h
    weatherDesc.innerHTML = data.weather[0].main;
    weatherIcon.src = `images/${data.weather[0].main}.png`;

    weatherBox.style.display = "block";
    document.querySelector(".error").style.display = "none";
  }
}

async function getForecast(city) {
  const response = await fetch(apiForecastUrl + city + `&appid=${apiKey}`);
  const data = await response.json();

  let dailyForecasts = [];
  let currentDay = "";

  data.list.forEach((forecast) => {
    const date = new Date(forecast.dt_txt);

    const weekday = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
    }).format(date);
    const monthDay = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);

    const day = `${weekday},<br>${monthDay}`;

    let temp_min = forecast.main.temp_min;
    let temp_max = forecast.main.temp_max;

    // Convert the temperatures if the unit is Fahrenheit
    if (unit === "imperial") {
      temp_min = (temp_min * 9) / 5 + 32; // Celsius to Fahrenheit
      temp_max = (temp_max * 9) / 5 + 32; // Celsius to Fahrenheit
    }

    if (day !== currentDay) {
      dailyForecasts.push({
        date: day,
        temp_min: Math.round(temp_min),
        temp_max: Math.round(temp_max),
        weather: forecast.weather[0].main,
        // icon: forecast.weather[0].icon
      });
      currentDay = day;
    } else {
      dailyForecasts[dailyForecasts.length - 1].temp_min = Math.min(
        dailyForecasts[dailyForecasts.length - 1].temp_min,
        temp_min
      );
      dailyForecasts[dailyForecasts.length - 1].temp_max = Math.max(
        dailyForecasts[dailyForecasts.length - 1].temp_max,
        temp_max
      );
    }
  });

  displayForecast(dailyForecasts);
}

function displayForecast(dailyForecasts) {
  const forecastContainer = document.getElementById("forecast-data");
  forecastContainer.innerHTML = ""; // Clear previous forecast data

  dailyForecasts.forEach((forecast) => {
    const forecastElement = document.createElement("div");
    forecastElement.classList.add("forecast-day");

    forecastElement.innerHTML = `
            <p>${forecast.date}</p>
            <img src="images/${forecast.weather}.png" alt="${
      forecast.weather
    }" class = "small"/>
            <p>${forecast.weather}</p>
            <p class = "high">${Math.round(forecast.temp_max)}°${
      unit === "metric" ? "C" : "F"
    }</p>
            <p>${Math.round(forecast.temp_min)}°${
      unit === "metric" ? "C" : "F"
    }</p>
        `;

    forecastContainer.appendChild(forecastElement);
  });
}

function onSuccess(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  getWeatherByLocation(lat, lon); // Get weather by coordinates
  getForecastByLocation(lat, lon); // Get the forecast by coordinates
}

function onError(error) {
  alert("Unable to retrieve your location. Please try again.");
}

async function getWeatherByLocation(lat, lon) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
  );
  const data = await response.json();
  updateWeather(data); // Function to update weather details in the DOM
}

function updateWeather(data) {
  city.innerHTML = data.name;
  temp.innerHTML =
    unit === "metric"
      ? `${Math.round(data.main.temp)}°C`
      : `${Math.round(data.main.temp * (9 / 5) + 32)}°F`;
  humidity.innerHTML = data.main.humidity + "%";
  weatherDesc.innerHTML = data.weather[0].main;
  weatherIcon.src = `images/${data.weather[0].main}.png`;

  weatherBox.style.display = "block";
  document.querySelector(".error").style.display = "none";
}

async function getForecastByLocation(lat, lon) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
  );
  const data = await response.json();

  // Process and display forecast data (similar to how we did with city input)
  let dailyForecasts = [];
  let currentDay = "";

  data.list.forEach((forecast) => {
    const date = new Date(forecast.dt_txt);
    const day = date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    if (day !== currentDay) {
      dailyForecasts.push({
        date: day,
        temp_min: forecast.main.temp_min,
        temp_max: forecast.main.temp_max,
        weather: forecast.weather[0].main,
        icon: forecast.weather[0].icon,
      });
      currentDay = day;
    } else {
      dailyForecasts[dailyForecasts.length - 1].temp_min = Math.min(
        dailyForecasts[dailyForecasts.length - 1].temp_min,
        forecast.main.temp_min
      );
      dailyForecasts[dailyForecasts.length - 1].temp_max = Math.max(
        dailyForecasts[dailyForecasts.length - 1].temp_max,
        forecast.main.temp_max
      );
    }
  });

  displayForecast(dailyForecasts);
}

const suggestionsContainer = document.createElement("div");
suggestionsContainer.className = "search-suggestions";
let timeoutId = null;
form.appendChild(suggestionsContainer);

input.addEventListener("input", (e) => {
  clearTimeout(timeoutId);
  const searchTerm = e.target.value.trim();

  if (searchTerm.length < 2) {
    suggestionsContainer.style.display = "none";
    return;
  }

  // Debounce API calls
  timeoutId = setTimeout(() => {
    getSuggestions(searchTerm);
  }, 300);
});

document.addEventListener("click", (e) => {
  if (!form.contains(e.target)) {
    suggestionsContainer.style.display = "none";
  }
});

async function getSuggestions(searchTerm) {
  console.log(searchTerm);
  try {
    const response = await fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${searchTerm}&limit=5&appid=${apiKey}`
    );
    const data = await response.json();

    if (data.length > 0) {
      displaySuggestions(data);
    } else {
      suggestionsContainer.style.display = "none";
    }
  } catch (error) {
    console.error("Error fetching suggestions:", error);
  }
}

function displaySuggestions(suggestions) {
  suggestionsContainer.innerHTML = "";

  suggestions.forEach((weather) => {
    const { name, state, lon, lat, country } = weather;

    const suggestionEl = document.createElement("div");
    suggestionEl.className = "suggestion-item";
    suggestionEl.innerHTML = `
        <div class="suggestion-info">
          <div class="suggestion-title">${name}</div>
          <div class="suggestion-year">${country}</div>
        </div>
      `;

    suggestionEl.addEventListener("click", () => {
      getWeatherByLocation(lat, lon);
      suggestionsContainer.style.display = "none";
      input.value = "";
    });

    suggestionsContainer.appendChild(suggestionEl);
  });

  suggestionsContainer.style.display = "block";
}
