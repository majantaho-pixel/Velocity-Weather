const apiKey = "8a6cdd714828679cba758f8f92394d90"; 

async function getWeather() {
  const city = document.getElementById("city").value;

  if (!city) return alert("Please enter a city");

  try {
    // Current + forecast (3 days for example)
    const res = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=7&aqi=no&alerts=no`);
    const data = await res.json();

    // Current Weather
    document.getElementById("current-weather").innerHTML = `
      <h2>📍 ${data.location.name}, ${data.location.country}</h2>
      <p>🌡️ ${data.current.temp_c} °C</p>
      <p>🌥️ ${data.current.condition.text}</p>
      <p>💧 Humidity: ${data.current.humidity}%</p>
      <p>🌬️ Wind: ${data.current.wind_kph} kph</p>
    `;

    // Hourly Forecast (today)
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

  } catch (error) {
    document.getElementById("current-weather").innerHTML = "⚠️ City not found or API error";
    document.getElementById("hourly-forecast").innerHTML = "";
    document.getElementById("daily-forecast").innerHTML = "";
  }
}
