import React from 'react';
import { formatDate } from './utils';

const WeatherCard = ({ weather, pollution }) => {
  if (!weather || !weather.data || !weather.data.main) return null;

  return (
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
          alt="Weather icon"
        />
        <div className="flex flex-col flex-1 gap-1 text-left">
          <p className="font-medium text-5xl" id="temp">
            {Math.round(weather.data.main.temp)}<sup className="text-3xl">℃</sup>
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
          <b className="font-semibold text-sm">Air quality (PM10)</b>
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
  );
};

export default WeatherCard;
