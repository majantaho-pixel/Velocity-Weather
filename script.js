// WeatherAPI.com key (same as your code)
const apiKey = "8a6cdd714828679cba758f8f92394d90";

let weatherChart = null;

async function getWeather() {
  const input = document.getElementById("city");
  const city = input.value.trim();

  if (!city) {
    alert("Please enter a city");
    return;
  }

  fetchWeather(city);
}

function getLocationWeather() {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      fetchWeather(`${lat},${lon}`);
    },
    () => alert("Unable to get location")
  );
}

async function fetchWeather(query) {
  try {
    const res = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${query}&days=3&aqi=no&alerts=no`
    );

    const data = await res.json();

    // API error handling
    if (data.error) {
      throw new Error(data.error.message);
    }

    // Current Weather
    document.getElementById("current-weather").innerHTML = `
      <h2>📍 ${data.location.name}, ${data.location.country}</h2>
      <p>🌡️ ${data.current.temp_c} °C</p>
      <p>🌥️ ${data.current.condition.text}</p>
      <p>💧 Humidity: ${data.current.humidity}%</p>
      <p>🌬️ Wind: ${data.current.wind_kph} kph</p>
    `;

    // Hourly Forecast
    const hourlyDiv = document.getElementById("hourly-forecast");
    hourlyDiv.innerHTML = "";
    data.forecast.forecastday[0].hour.forEach(hour => {
      hourlyDiv.innerHTML += `
        <div class="forecast-item">
          <p>${hour.time.split(" ")[1]}</p>
          <p>${hour.temp_c}°C</p>
          <p>${hour.condition.text}</p>
        </div>
      `;
    });

    // Daily Forecast
    const dailyDiv = document.getElementById("daily-forecast");
    dailyDiv.innerHTML = "";
    data.forecast.forecastday.forEach(day => {
      dailyDiv.innerHTML += `
        <div class="forecast-item">
          <p>${day.date}</p>
          <p>⬆ ${day.day.maxtemp_c}°C</p>
          <p>⬇ ${day.day.mintemp_c}°C</p>
          <p>${day.day.condition.text}</p>
        </div>
      `;
    });

    // Chart (3-day forecast)
    const ctx = document.getElementById("monthlyChart").getContext("2d");

    if (weatherChart) {
      weatherChart.destroy();
    }

    weatherChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.forecast.forecastday.map(d => d.date),
        datasets: [
          {
            label: "Max Temp °C",
            data: data.forecast.forecastday.map(d => d.day.maxtemp_c),
            fill: false
          },
          {
            label: "Min Temp °C",
            data: data.forecast.forecastday.map(d => d.day.mintemp_c),
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "top" }
        }
      }
    });

  } catch (error) {
    document.getElementById("current-weather").innerHTML =
      "⚠️ " + error.message;
    document.getElementById("hourly-forecast").innerHTML = "";
    document.getElementById("daily-forecast").innerHTML = "";
  }
}
