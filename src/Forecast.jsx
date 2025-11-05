export default function Forecast({ weekday, icon, temp_max, temp_min }) {
  const weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return (
    <div className="card p-4 rounded-lg flex-col items-center">
      <h3 className="font-semibold">{weekdays[weekday]}</h3>
      <img
        src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
        height={80}
        width={80}
      />
      <div className="flex gap-6 justify-center text-left">
        <div className="flex-col">
          <b className="font-semibold text-xs">Max</b>
          <p className="text-xl">{Math.round(temp_max)}°</p>
        </div>
        <div className="flex-col">
          <b className="font-semibold text-xs">Min</b>
          <p className="text-xl">{Math.round(temp_min)}°</p>
        </div>
      </div>
    </div>
  )
}