const apiKey = "8a6cdd714828679cba758f8f92394d90"; // Replace with your WeatherAPI.com key

async function getWeather() {
  const city = document.getElementById("city").value;
  if (!city) return alert("Please enter a city");

  fetchWeather(city);
}

function getLocationWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        fetchWeather(`${lat},${lon}`);
      },
      err => alert("Unable to get location")
    );
  } else {
    alert("Geolocation not supported");
  }
}

async function fetchWeather(query) {
  try {
    const res = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${query}&days=30&aqi=no&alerts=no`);
    const data = await res.json();

    // Current Weather
    document.getElementById("current-weather").innerHTML = `
      <h2>📍 ${data.location.name}, ${data.location.country}</h2>
      <p>🌡️ ${data.current.temp_c} °C</p>
      <p>🌥️ ${data.current.condition.text}</p>
      <p>💧 Humidity: ${data.current.humidity}%</p>
      <p>🌬️ Wind: ${data.current.wind_kph} kph</p>
    `;

    // Hourly Forecast (Today)
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
          <p>Max: ${day.day.maxtemp_c}°C</p>
          <p>Min: ${day.day.mintemp_c}°C</p>
          <p>${day.day.condition.text}</p>
        </div>
      `;
    });

    // Monthly Forecast Chart (Temp trend)
    const ctx = document.getElementById("monthlyChart").getContext("2d");
    const labels = data.forecast.forecastday.map(d => d.date);
    const maxTemps = data.forecast.forecastday.map(d => d.day.maxtemp_c);
    const minTemps = data.forecast.forecastday.map(d => d.day.mintemp_c);

    new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          { label: "Max Temp °C", data: maxTemps, borderColor: "#ff4500", fill: false },
          { label: "Min Temp °C", data: minTemps, borderColor: "#1e90ff", fill: false }
        ]
      },
      options: { responsive: true, plugins: { legend: { position: "top" } } }
    });

  } catch (error) {
    document.getElementById("current-weather").innerHTML = "⚠️ City not found or API error";
    document.getElementById("hourly-forecast").innerHTML = "";
    document.getElementById("daily-forecast").innerHTML = "";
  }
}
