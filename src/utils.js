export const weekdays = [
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
export const formatDate = (date) => {
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

export const calculateAQI = (pm10) => {
  const breakpoints = [
    { cLow: 0, cHigh: 54, iLow: 0, iHigh: 50 },
    { cLow: 55, cHigh: 154, iLow: 51, iHigh: 100 },
    { cLow: 155, cHigh: 254, iLow: 101, iHigh: 150 },
    { cLow: 255, cHigh: 354, iLow: 151, iHigh: 200 },
    { cLow: 355, cHigh: 424, iLow: 201, iHigh: 300 },
    { cLow: 425, cHigh: 604, iLow: 301, iHigh: 500 },
  ];

  const bp = breakpoints.find(b => pm10 >= b.cLow && pm10 <= b.cHigh);
  if (!bp) return 500; // clamp to max

  const { cLow, cHigh, iLow, iHigh } = bp;
  const aqi = ((iHigh - iLow) / (cHigh - cLow)) * (pm10 - cLow) + iLow;
  return Math.round(aqi);
}
