import { useState } from "react";
import axios from "axios";
import Forecast from "./Forecast.jsx";
import WeatherCard from "./WeatherCard.jsx";
import { calculateAQI } from "./utils";

export default function App() {
  const [input, setInput] = useState("");

  const [weather, setWeather] = useState({
    loading: false,
    data: {},
    date: new Date(),
    desc: "",
    error: false,
  });

  const [pollution, setPollution] = useState({
    data: { list: [] },
    aqi: 0,
    error: false,
  });

  const [forecast, setForecast] = useState({
    data: { list: [] },
    error: false,
  });

  // Handle Enter key press in input field
  const handleEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      search();
    }
  }

  // Handle form submission
  function handleSubmit(e) {
    e.preventDefault();
    search();
  }

  // Search for weather data
  async function search() {
    setInput("");
    setWeather({ ...weather, loading: true });
    const url = "https://api.openweathermap.org/data/2.5/weather";
    const api_key = import.meta.env.VITE_WEATHER_API_KEY;
    await axios
      .get(url, {
        params: {
          q: input,
          units: "metric",
          lang: "en",
          appid: api_key,
        },
      })
      .then((res) => {
        console.log("weather res", res);
        // Fetch pollution data using the coordinates from the weather response
        fetchPollution(res.data.coord.lat, res.data.coord.lon);
        setWeather({ data: res.data, date: new Date(res.data.dt * 1000), loading: false, error: false });
        fetchForecast(input);
      })
      .catch((error) => {
        setWeather({ ...weather, data: {}, error: true });
        setInput("");
        console.log("weather fetch error", error);
      });
  };

  // Fetch pollution data
  const fetchPollution = async (ilat, ilon) => {
    const url = "https://api.openweathermap.org/data/2.5/air_pollution";
    const api_key = import.meta.env.VITE_WEATHER_API_KEY;
    await axios
      .get(url, {
        params: {
          lat: ilat,
          lon: ilon,
          appid: api_key,
        },
      })
      .then((res) => {
        console.log("Pollution res", res);
        let aqi = calculateAQI(res.data.list[0].components.pm10);
        console.log("AQI:", aqi);
        setPollution({ data: res.data, aqi: aqi, error: false });
      })
      .catch((error) => {
        setPollution({ data: {}, aqi: 0, error: true });
        setInput("");
        console.log("Pollution fetch error", error);
      });
  };

  // Fetch forecast data
  const fetchForecast = async (input) => {
    const url = "https://api.openweathermap.org/data/2.5/forecast";
    const api_key = import.meta.env.VITE_WEATHER_API_KEY;
    await axios
      .get(url, {
        params: {
          q: input,
          units: "metric",
          appid: api_key,
        },
      })
      .then((res) => {
        console.log("Forecast res", res);
        setForecast({ data: res.data, error: false });
      })
      .catch((error) => {
        setForecast({ data: {}, error: true });
        setInput("");
        console.log("Forecast fetch error", error);
      });
  };

  return (
    <main className="flex flex-col gap-2 items-center text-center">
      <h1 className="font-bold mb-2 mt-6 text-3xl" id="header">Weather</h1>
      <form className="card p-4 rounded-lg" onSubmit={handleSubmit}>
        <div className="flex flex-col flex-wrap justify-center">
          <div className="flex flex-wrap gap-2 items-center justify-center">
            <input
              className="px-2 rounded-md"
              type="text"
              inputMode="search"
              enterKeyHint="search"
              id="input"
              name="city"
              placeholder="Enter a city"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleEnter}
              required
            />
            <button type="submit">Get Weather</button>
          </div>
          <p id="input-error"></p>
        </div>
      </form>
      <p id="output-error"></p>
      {weather.loading && (
        <img
          id="loading"
          src="https://upload.wikimedia.org/wikipedia/commons/7/7a/Ajax_loader_metal_512.gif"
          alt="Please wait"
          height={100}
          width={100}
        />
      )}
      {weather.error && <span>City not found!</span>}

      <WeatherCard weather={weather} pollution={pollution} />

      {
        forecast && forecast.data.list && forecast.data.list.length > 0 && (
          <div>
            <h2 className="font-bold text-2xl my-2">Daily Forecast</h2>
            <div className="flex flex-wrap gap-4 justify-center">
              {[0, 7, 15, 23, 31, 39].map((index, i) => {
                const item = forecast.data.list[index];
                if (!item) return null;
                return (
                  <Forecast
                    key={i}
                    weekday={(weather.date.getDay() + i) % 7}
                    icon={item.weather[0].icon}
                    temp_max={item.main.temp_max}
                    temp_min={item.main.temp_min}
                  />
                );
              })}
            </div>
          </div>
        )
      }
    </main >
  );
}
