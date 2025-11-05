import { useState } from "react";
import axios from "axios";
import Forecast from "./Forecast.jsx";

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

  const weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Function to format the date and time
  // Returns a string in the format: "Weekday Day Month, Hour:Minute AM/PM"
  // Example: "Monday 1 January, 12:30 PM"
  const formatDate = (date) => {
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    let hours = date.getHours();
    if (date.getHours() > 12) {
      hours -= 12;
    } else if (date.getHours() === 0) {
      hours = 12;
    }

    let meridiem = "AM",
      minutes = String(date.getMinutes());

    if (date.getMinutes() < 10) {
      minutes = "0" + minutes;
    }

    if (date.getHours() >= 12 && minutes !== "00") {
      meridiem = "PM";
    } else if (date.getHours() === 12 && minutes === "00") {
      meridiem = "noon";
    } else if (date.getHours() === 0 && minutes === "00") {
      meridiem = "midnight";
    }

    return `${weekdays[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]
      }, ${hours}:${minutes} ${meridiem}`;
  };

  const calculateAQI_PM25 = (pm25) => {
    const breakpoints = [
      { cLow: 0.0, cHigh: 9.0, iLow: 0, iHigh: 50 },
      { cLow: 9.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
      { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
      { cLow: 55.5, cHigh: 125.4, iLow: 151, iHigh: 200 },
      { cLow: 125.5, cHigh: 225.4, iLow: 201, iHigh: 300 },
      { cLow: 225.5, cHigh: 325.4, iLow: 301, iHigh: 500 },
    ];

    const bp = breakpoints.find(b => pm25 >= b.cLow && pm25 <= b.cHigh);
    if (!bp) return 500; // clamp to max

    const { cLow, cHigh, iLow, iHigh } = bp;
    const aqi = ((iHigh - iLow) / (cHigh - cLow)) * (pm25 - cLow) + iLow;
    return Math.round(aqi);
  }

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
        let aqi = calculateAQI_PM25(res.data.list[0].components.pm2_5);
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
      {weather && weather.data.main && (
        <div className="card p-4 rounded-lg flex flex-col items-center justify-center gap-4">
          <div>
            <h2 className="font-bold text-2xl" id="city-name">
              {weather.data.name}, {weather.data.sys.country}
            </h2>
            <p id="today">
              {formatDate(weather.date)}
            </p>
          </div>
          <div className="flex items-center">
            <img
              src={`https://openweathermap.org/img/wn/${weather.data.weather[0].icon}@2x.png`}
              id="icon"
            />
            <div className="flex flex-col flex-1 gap-1 text-left">
              <p className="font-medium text-5xl" id="temp">
                {Math.round(weather.data.main.temp)}<sup className="text-3xl">℃</sup> {/* Using Math.round to round the temperature */}
              </p>
              <p className="text-2xl" id="desc">
                {weather.data.weather[0].main}
              </p>
            </div>
          </div>
          <p className="flex gap-3 items-center justify-center" id="feels">
            <b className="font-semibold">Feels&nbsp;like</b>
            <span className="text-lg">{Math.round(weather.data.main.feels_like)}°</span>
          </p>
          <div className="flex flex-wrap gap-5 justify-center text-left">
            <div className="flex-col" id="pollution">
              <b className="font-semibold text-sm">Air&nbsp;quality</b>
              <p className="text-lg">{pollution.aqi}</p>
            </div>
            <div className="flex-col" id="humidity">
              <b className="font-semibold text-sm">Humidity</b>
              <p className="text-lg">{weather.data.main.humidity}%</p>
            </div>
            <div className="flex-col" id="pressure">
              <b className="font-semibold text-sm">Pressure</b>
              <p className="text-lg">{weather.data.main.pressure}&nbsp;hPa</p>
            </div>
            <div className="flex-col" id="visibility">
              <b className="font-semibold text-sm">Visibility</b>
              <p className="text-lg">{weather.data.visibility / 1000}&nbsp;km</p>
            </div>
            <div className="flex-col" id="speed">
              <b className="font-semibold text-sm">Wind</b>
              <p className="text-lg">{weather.data.wind.speed}&nbsp;m/s</p>
            </div>
          </div>
        </div>
      )
      }
      {
        forecast && forecast.data.list[0] && (
          <div>
            <h2 className="font-bold text-2xl my-2">Daily Forecast</h2>
            <div className="flex flex-wrap gap-4 justify-center">
              <Forecast
                weekday={weather.date.getDay()}
                icon={weather.data.weather[0].icon}
                temp_max={weather.data.main.temp_max}
                temp_min={weather.data.main.temp_min}
              />
              <Forecast
                weekday={(weather.date.getDay() + 1) % 7}
                icon={forecast.data.list[7].weather[0].icon}
                temp_max={forecast.data.list[7].main.temp_max}
                temp_min={forecast.data.list[7].main.temp_min}
              />
              <Forecast
                weekday={(weather.date.getDay() + 2) % 7}
                icon={forecast.data.list[15].weather[0].icon}
                temp_max={forecast.data.list[15].main.temp_max}
                temp_min={forecast.data.list[15].main.temp_min}
              />
              <Forecast
                weekday={(weather.date.getDay() + 3) % 7}
                icon={forecast.data.list[23].weather[0].icon}
                temp_max={forecast.data.list[23].main.temp_max}
                temp_min={forecast.data.list[23].main.temp_min}
              />
              <Forecast
                weekday={(weather.date.getDay() + 4) % 7}
                icon={forecast.data.list[31].weather[0].icon}
                temp_max={forecast.data.list[31].main.temp_max}
                temp_min={forecast.data.list[31].main.temp_min}
              />
              <Forecast
                weekday={(weather.date.getDay() + 5) % 7}
                icon={forecast.data.list[39].weather[0].icon}
                temp_max={forecast.data.list[39].main.temp_max}
                temp_min={forecast.data.list[39].main.temp_min}
              />
            </div>
          </div>
        )
      }
    </main >
  );
}
