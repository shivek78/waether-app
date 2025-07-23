const apiKey = "915722665e404b299ae193045252307";
const weatherForm = document.getElementById("weather-form");
const cityInput = document.getElementById("city-input");
const cityNameEl = document.getElementById("city-name");
const conditionEl = document.getElementById("condition");
const temperatureEl = document.getElementById("temperature");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const weatherIconEl = document.getElementById("weather-icon");
const localTimeEl = document.getElementById("local-time");
const toggleUnitBtn = document.getElementById("toggle-unit");
const weatherApp = document.querySelector(".weather-app");
const historyContainer = document.getElementById("history");

let isCelsius = true;
let currentWeatherData = null;
let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];

// Animate number change for temperature
function animateNumber(element, start, end, duration = 800) {
  let startTime = null;

  function animation(currentTime) {
    if (!startTime) startTime = currentTime;
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const value = Math.floor(progress * (end - start) + start);
    element.textContent = `${value}°${isCelsius ? "C" : "F"}`;
    if (progress < 1) {
      requestAnimationFrame(animation);
    }
  }
  requestAnimationFrame(animation);
}

// Convert temperature for display
function updateTemperature(data) {
  if (!data) return;
  if (isCelsius) {
    animateNumber(temperatureEl, parseInt(temperatureEl.textContent) || 0, data.current.temp_c);
  } else {
    animateNumber(temperatureEl, parseInt(temperatureEl.textContent) || 32, data.current.temp_f);
  }
}

// Color background based on temperature Celsius
function updateBackgroundByTemp(tempC) {
  let color;
  if(tempC <= 0) color = '#70a1ff';         // icy cold - blue
  else if(tempC <= 15) color = '#74b9ff';   // cool - light blue
  else if(tempC <= 25) color = '#fdcb6e';   // warm - warm yellow
  else color = '#54a568ff';                    // hot - red
  weatherApp.style.backgroundColor = color;
}

function renderSearchHistory() {
  historyContainer.innerHTML = "";
  searchHistory.forEach(city => {
    const btn = document.createElement("button");
    btn.textContent = city;
    btn.classList.add("history-btn");
    btn.setAttribute("aria-label", `Search for ${city}`);
    btn.onclick = () => getWeather(city);
    historyContainer.appendChild(btn);
  });
}

function saveSearch(city) {
  if (!searchHistory.includes(city)) {
    searchHistory.unshift(city);
    if (searchHistory.length > 5) searchHistory.pop();
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    renderSearchHistory();
  }
}

async function getWeather(city) {
  const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(city)}&aqi=no`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("City not found");
    const data = await response.json();
    currentWeatherData = data;

    cityNameEl.textContent = `${data.location.name}, ${data.location.country}`;
    conditionEl.textContent = data.current.condition.text;
    humidityEl.textContent = `Humidity: ${data.current.humidity}%`;
    windEl.textContent = `Wind: ${data.current.wind_kph} km/h`;
    weatherIconEl.src = "https:" + data.current.condition.icon;
    weatherIconEl.alt = data.current.condition.text;
    localTimeEl.textContent = `Local time: ${data.location.localtime}`;

    updateTemperature(data);
    updateBackgroundByTemp(data.current.temp_c);
    saveSearch(data.location.name);
  } catch (error) {
    cityNameEl.textContent = "City Not Found";
    conditionEl.textContent = "-";
    temperatureEl.textContent = "--";
    humidityEl.textContent = "--";
    windEl.textContent = "--";
    weatherIconEl.src = "https://cdn-icons-png.flaticon.com/512/1163/1163661.png";
    weatherIconEl.alt = "weather icon";
    localTimeEl.textContent = "Local time: --";
  }
}

toggleUnitBtn.addEventListener("click", () => {
  if (!currentWeatherData) return;
  isCelsius = !isCelsius;
  updateTemperature(currentWeatherData);
  toggleUnitBtn.textContent = isCelsius ? "Show °F" : "Show °C";
});

weatherForm.addEventListener("submit", e => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (city) {
    getWeather(city);
    cityInput.value = "";
  }
});

// Initial load - show default city
renderSearchHistory();
getWeather("Delhi");
