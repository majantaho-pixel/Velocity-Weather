const apiKey = "4719ddac770bdc212938324e7cf8345f";
let weatherChart = null;

// Step 1: City input
async function getWeather() {
  const city = document.getElementById("city").value.trim();
  if (!city) return alert("Please enter a city");

  try {
    const { lat, lon } = await getLatLon(city);
    fetchWeather(lat, lon);
  } catch (err) {
    alert(err.message);
  }
}

// Step 2: Geolocation
function getLocationWeather() {
  if (!navigator.geolocation) return alert("Geolocation not supported");
  navigator.geolocation.getCurrentPosition(
    pos => fetchWeather(pos.coords.latitude, pos.coords.longitude),
    () => alert("Unable to get location")
  );
}

// Step 3: Get lat/lon from city
async function getLatLon(city) {
  const res = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`);
  const data = await res.json();
  if (!data.length) throw new Error("City not found");
  return { lat: data[0].lat, lon: data[0].lon };
}

// Step 4: Fetch weather
async function fetchWeather(lat, lon) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=metric&appid=${apiKey}`
    );
    const data = await res.json();
    if (data.cod) throw new Error(data.message || "API Error");

    // Current weather
    const cur = data.current;
    document.getElementById("current-weather").innerHTML = `
      <h2>📍 ${cur.name || "Location"}, ${cur.country || ""}</h2>
      <p>🌡️ ${cur.temp} °C</p>
      <p>🌥️ ${cur.weather[0].description}</p>
      <p>💧 Humidity: ${cur.humidity}%</p>
      <p>🌬️ Wind: ${cur.wind_speed} m/s</p>
    `;

    // Hourly forecast (next 12 hours)
    const hourlyDiv = document.getElementById("hourly-forecast");
    hourlyDiv.innerHTML = "";
    data.hourly.slice(0,12).forEach(hour => {
      const dt = new Date(hour.dt * 1000);
      const time = dt.getHours() + ":00";
      hourlyDiv.innerHTML += `
        <div class="forecast-item">
          <p>${time}</p>
          <p>${hour.temp}°C</p>
          <p>${hour.weather[0].description}</p>
        </div>
      `;
    });

    // Daily forecast (next 3 days)
    const dailyDiv = document.getElementById("daily-forecast");
    dailyDiv.innerHTML = "";
    data.daily.slice(0,3).forEach(day => {
      const dt = new Date(day.dt * 1000);
      const date = dt.toLocaleDateString();
      dailyDiv.innerHTML += `
        <div class="forecast-item">
          <p>${date}</p>
          <p>⬆ ${day.temp.max}°C</p>
          <p>⬇ ${day.temp.min}°C</p>
          <p>${day.weather[0].description}</p>
        </div>
      `;
    });

    // Chart
    const ctx = document.getElementById("monthlyChart").getContext("2d");
    if (weatherChart) weatherChart.destroy();
    weatherChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.daily.slice(0,3).map(d => new Date(d.dt*1000).toLocaleDateString()),
        datasets: [
          { label: "Max Temp °C", data: data.daily.slice(0,3).map(d=>d.temp.max), borderColor: "#ff4500", fill:false },
          { label: "Min Temp °C", data: data.daily.slice(0,3).map(d=>d.temp.min), borderColor: "#1e90ff", fill:false }
        ]
      },
      options: { responsive:true, plugins:{legend:{position:"top"}} }
    });

  } catch (err) {
    document.getElementById("current-weather").innerHTML = "⚠️ "+err.message;
    document.getElementById("hourly-forecast").innerHTML = "";
    document.getElementById("daily-forecast").innerHTML = "";
  }
}
