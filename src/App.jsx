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

  const [aqi, setAQI] = useState({
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
          fetchAQI(res.data.coord.lat, res.data.coord.lon);
          setWeather({ data: res.data, loading: false, error: false });
        })
        .catch((error) => {
          setWeather({ ...weather, data: {}, error: true });
          setInput("");
          console.log("weather fetch error", error);
        });
    }
  };

  const fetchAQI = async (ilat, ilon) => {
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
        console.log("AQI res", res);

        let aqi_desc = "";

        switch (res.data.list[0].main.aqi) {
          case 1:
            aqi_desc = "Good";
            break;
          case 2:
            aqi_desc = "Fair";
            break;
          case 3:
            aqi_desc = "Moderate";
            break;
          case 4:
            aqi_desc = "Poor";
            break;
          case 5:
            aqi_desc = "Very Poor";
            break;
          default:
            aqi_desc = "Unknown";
        }

        /* in case if the above switch does not work */
        if (aqi_desc === "") {
          aqi_desc = "Unknown";
        }

        setAQI({ data: res.data, desc: aqi_desc, error: false });
      })
      .catch((error) => {
        setAQI({ data: {}, desc: "", error: true });
        setInput("");
        console.log("AQI fetch error", error);
      });
  };

  return (
    <main className="flex flex-col items-center text-center">
      <h1 className="font-bold my-3 text-3xl">Weather</h1>
      <div className="card p-4 rounded-lg" id="weather-card">
        <div className="flex flex-col flex-wrap justify-center">
          <input
            className="px-1 rounded-md"
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
          <div>
            <h2 className="font-bold text-2xl" id="city-name">
              {weather.data.name}, {weather.data.sys.country}
            </h2>
            <p className="mb-2 text-sm" id="today">
              {today()}
            </p>
            <div className="flex gap-5 items-center">
              <div>
                <div className="flex justify-center" id="icon">
                  <img
                    src={`https://openweathermap.org/img/wn/${weather.data.weather[0].icon}@2x.png`}
                  />
                </div>
                <p className="font-bold text-xl" id="temp">
                  {weather.data.main.temp}&nbsp;℃
                </p>
                <p className="font-semibold text-sm" id="desc">
                  {weather.data.weather[0].main}
                </p>
                <p className="text-sm" id="feels">
                  Feels like {weather.data.main.feels_like}&nbsp;℃
                </p>
              </div>
              <div className="flex-1 text-left">
                {aqi &&
                  Array.isArray(aqi.data?.list) &&
                  aqi.data.list.length > 0 && (
                    <p id="aqi">
                      <b className="font-semibold">Air quality:</b> {aqi.desc}
                    </p>
                  )}
                <p id="humidity">
                  <b className="font-semibold">Humidity:</b>{" "}
                  {weather.data.main.humidity}%
                </p>
                <p id="pressure">
                  <b className="font-semibold">Pressure:</b>{" "}
                  {weather.data.main.pressure}&nbsp;hPa
                </p>
                <p id="speed">
                  <b className="font-semibold">Wind&nbsp;speed:</b>{" "}
                  {weather.data.wind.speed}&nbsp;m/s
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
