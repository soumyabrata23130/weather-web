import { useState } from "react";
import axios from "axios";

export default function App() {
  const [input, setInput] = useState("");

  const [weather, setWeather] = useState({
    loading: false,
    data: {},
    desc: "",
    error: false,
  });

  const [pollution, setPollution] = useState({
    data: { list: [] },
    error: false,
  });

  const today = () => {
    const today = new Date();

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
    const weekdays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    let hours = today.getHours();
    if (today.getHours() > 12) {
      hours -= 12;
    } else if (today.getHours() === 0) {
      hours = 12;
    }

    let meridiem = "AM",
      minutes = String(today.getMinutes());

    if (today.getMinutes() < 10) {
      minutes = "0" + minutes;
    }

    if (today.getHours() >= 12 && minutes !== "00") {
      meridiem = "PM";
    } else if (today.getHours() === 12 && minutes === "00") {
      meridiem = "noon";
    } else if (today.getHours() === 0 && minutes === "00") {
      meridiem = "midnight";
    }

    return `${weekdays[today.getDay()]} ${today.getDate()} ${months[today.getMonth()]
      }, ${hours}:${minutes} ${meridiem}`;
  };

  const search = async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setInput("");
      setWeather({ ...weather, loading: true });
      const url = "https://api.openweathermap.org/data/2.5/weather";
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
          console.log("weather res", res);
          fetchPollution(res.data.coord.lat, res.data.coord.lon);
          setWeather({ data: res.data, loading: false, error: false });
        })
        .catch((error) => {
          setWeather({ ...weather, data: {}, error: true });
          setInput("");
          console.log("weather fetch error", error);
        });
    }
  };

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
        setPollution({ data: res.data, error: false });
      })
      .catch((error) => {
        setPollution({ data: {}, desc: "", error: true });
        setInput("");
        console.log("Pollution fetch error", error);
      });
  };

  return (
    <main className="flex flex-col items-center text-center">
      <h1 className="font-bold my-3 text-3xl">Weather</h1>
      <div className="card p-4 rounded-lg" id="weather-card">
        <div className="flex flex-col flex-wrap justify-center">
          <input
            className="px-2 rounded-md"
            type="text"
            id="input"
            name="city"
            placeholder="Enter a city"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyUp={search}
            required
          />
          <p id="input-error"></p>
        </div>
        <hr className="my-1" />
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
          <div className="flex flex-col items-center">
            <div>
              <h2 className="font-bold text-2xl" id="city-name">
                {weather.data.name}, {weather.data.sys.country}
              </h2>
              <p id="today">
                {today()}
              </p>
            </div>
            <div className="flex items-center justify-center">
              <img
                src={`https://openweathermap.org/img/wn/${weather.data.weather[0].icon}@2x.png`}
                id="icon"
              />
              <div className="flex gap-9">
                <p className="font-medium text-5xl" id="temp">
                  {Math.round(weather.data.main.temp)}<sup className="text-3xl">℃</sup> {/* Using Math.round to round the temperature */}
                </p>
                <div className="flex flex-col gap-1 text-left">
                  <p className="font-semibold text-2xl" id="desc">
                    {weather.data.weather[0].main}
                  </p>
                  <p id="feels">
                    <span className="font-medium">Feels&nbsp;like</span> {weather.data.main.feels_like}℃
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-6 flex-1 mx-6 text-left">
              {pollution &&
                Array.isArray(pollution.data?.list) &&
                pollution.data.list.length > 0 && (
                  <div className="flex-col" id="pollution">
                    <b className="font-semibold text-sm">Air&nbsp;quality</b>
                    <p className="text-lg">{pollution.data.list[0].main.aqi}</p>
                  </div>
                )
              }
              <div className="flex-col" id="humidity">
                <b className="font-semibold text-sm">Humidity</b>
                <p className="text-lg">{weather.data.main.humidity}%</p>
              </div>
              <div className="flex-col" id="pressure">
                <b className="font-semibold text-sm">Pressure</b>
                <p className="text-lg">{weather.data.main.pressure}&nbsp;hPa</p>
              </div>
              <div className="flex-col" id="speed">
                <b className="font-semibold text-sm">Wind</b>
                <p className="text-lg">{weather.data.wind.speed}&nbsp;m/s</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
