const apiKey = "8a6cdd714828679cba758f8f92394d90";

function getWeather() {
  const city = document.getElementById("city").value;

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
    .then(response => response.json())
    .then(data => {
      if (data.cod !== 200) {
        document.getElementById("result").innerHTML = "❌ City not found";
        return;
      }

      document.getElementById("result").innerHTML = `
        <h2>📍 ${data.name}, ${data.sys.country}</h2>
        <p>🌡️ Temperature: ${data.main.temp} °C</p>
        <p>🌥️ Weather: ${data.weather[0].description}</p>
        <p>💧 Humidity: ${data.main.humidity}%</p>
        <p>🌬️ Wind Speed: ${data.wind.speed} m/s</p>
      `;
    })
    .catch(() => {
      document.getElementById("result").innerHTML = "⚠️ Error loading data";
    });
}
