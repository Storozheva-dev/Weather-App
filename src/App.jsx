import WeatherBackground from "./components/WeatherBackground";
import { useEffect, useState } from "react";
// import { Helper } from "./components/Helper";
import {
  HumidityIcon,
  SunsetIcon,
  SunriseIcon,
  VisibilityIcon,
  WindIcon,
} from "./components/Icons";
import Loader from "./components/Loader/Loader";

const App = () => {
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [unit, setUnit] = useState("C");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_KEY = "4e56b9de919185ae7acbb2a06e32b173";

  useEffect(() => {
    if (city.trim().length >= 3 && !weather) {
      const timer = setTimeout(() => {
        fetchSuggestions(city);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [city, weather]);

  const fetchSuggestions = async (query) => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`
      );
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      setError("Failed to load suggestions.");
    }
  };

  const fetchWeatherData = async (url, label = "") => {
    try {
      setLoading(true);

      const response = await fetch(url);
      if (!response.ok)
        throw new Error((await response.json()).message || "City not found.");

      const data = await response.json();
      setWeather(data);
      setCity(label);
      setSuggestions([]);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (city.trim().length < 3) {
      setError("Please enter at least 3 characters.");
      return;
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city.trim()}&appid=${API_KEY}&units=metric`;
    await fetchWeatherData(url);
  };

  const getWeatherCondition = () => {
    if (!weather) return null;
    const now = Date.now() / 1000;
    return {
      main: weather.weather[0].main,
      isDay: now >= weather.sys.sunrise && now < weather.sys.sunset,
    };
  };

  const convertTemp = (tempC) => {
    return unit === "C"
      ? `${Math.round(tempC)}°C`
      : `${Math.round((tempC * 9) / 5 + 32)}°F`;
  };

  const getHumidityValue = (humidity) => {
    if (humidity >= 70) return "High";
    if (humidity >= 40) return "Moderate";
    return "Low";
  };

  const getWindDirection = (deg) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "N"];
    return directions[Math.round(deg / 45) % 8];
  };

  const getVisibilityValue = (visibility) => {
    if (visibility >= 10000) return "Excellent";
    if (visibility >= 4000) return "Good";
    if (visibility >= 2000) return "Moderate";
    if (visibility >= 1000) return "Poor";
    return "Very Poor";
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
          <Loader />
        </div>
      )}
      <div className="min-h-screen">
        <WeatherBackground condition={getWeatherCondition()} />

        <div className="flex items-center justify-center p-6 min-h-screen">
          <div className="bg-transparent backdrop-filter backdrop-blur-md rounded-xl shadow-2xl p-8 max-w-md text-white w-full border border-white/30 relative z-10">
            <h1 className="text-4xl font-extrabold mb-6">Weather App</h1>

            {!weather ? (
              <form onSubmit={handleSearch} className="flex flex-col relative">
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city or country (min 3 letters)"
                  className="mb-4 p-3 rounded border border-white bg-transparent text-white placeholder:text-white focus:outline-none focus:border-blue-300 transition duration-300"
                />
                {suggestions.length > 0 && (
                  <div className="absolute top-12 left-0 right-0 bg-black/80 rounded z-10 max-h-60 overflow-y-auto">
                    {suggestions.map((s) => (
                      <button
                        type="button"
                        key={`${s.lat}-${s.lon}`}
                        onClick={() =>
                          fetchWeatherData(
                            `https://api.openweathermap.org/data/2.5/weather?lat=${s.lat}&lon=${s.lon}&appid=${API_KEY}&units=metric`,
                            `${s.name}, ${s.country}${
                              s.state ? `, ${s.state}` : ""
                            }`
                          )
                        }
                        className="block hover:bg-blue-700 bg-transparent px-4 py-2 text-sm text-left w-full transition-colors"
                      >
                        {s.name}, {s.country}
                        {s.state && `, ${s.state}`}
                      </button>
                    ))}
                  </div>
                )}
                {error && <p className="text-red-400 text-sm ">{error}</p>}
                <button
                  type="submit"
                  className="mt-2 bg-purple-700 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
                >
                  Get Weather
                </button>
              </form>
            ) : (
              <div className="mt-6 text-center transition-opacity duration-500">
                <button
                  onClick={() => {
                    setWeather(null);
                    setCity("");
                  }}
                  className="mb-4 bg-purple-900 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded transition-colors"
                >
                  New Search
                </button>

                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-3xl font-bold">{weather.name}</h2>
                  <button
                    onClick={() => setUnit((u) => (u === "C" ? "F" : "C"))}
                    className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-1 px-3 rounded transition-colors"
                  >
                    &deg;{unit}
                  </button>
                </div>

                <img
                  src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                  alt={weather.weather[0].description}
                  className="mx-auto my-4 animate-bounce"
                />

                <p className="text-4xl">{convertTemp(weather.main.temp)}</p>
                <p className="capitalize">{weather.weather[0].description}</p>

                <div className="flex flex-wrap justify-around mt-6">
                  {[
                    [
                      HumidityIcon,
                      "Humidity",
                      `${weather.main.humidity}% (${getHumidityValue(
                        weather.main.humidity
                      )})`,
                    ],
                    [
                      WindIcon,
                      "Wind",
                      `${weather.wind.speed} m/s ${
                        weather.wind.deg
                          ? `(${getWindDirection(weather.wind.deg)})`
                          : ""
                      }`,
                    ],
                    [
                      VisibilityIcon,
                      "Visibility",
                      getVisibilityValue(weather.visibility),
                    ],
                  ].map(([Icon, label, value]) => (
                    <div key={label} className="flex flex-col items-center m-2">
                      <Icon />
                      <p className="mt-1 font-semibold">{label}</p>
                      <p className="text-sm">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Sunrise и Sunset */}
                <div className="flex flex-wrap justify-around mt-6">
                  {[
                    [SunriseIcon, "Sunrise", weather.sys.sunrise],
                    [SunsetIcon, "Sunset", weather.sys.sunset],
                  ].map(([Icon, label, time]) => (
                    <div key={label} className="flex flex-col items-center m-2">
                      <Icon />
                      <p className="mt-1 font-semibold">{label}</p>
                      <p className="text-sm">
                        {new Date(time * 1000).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center text-sm">
                  <p>
                    <strong>
                      Feels like: {convertTemp(weather.main.feels_like)}
                    </strong>
                  </p>
                  <p>
                    <strong>Pressure: {weather.main.pressure} hPa</strong>
                  </p>
                </div>
              </div>
            )}
            {/* {error && <p className="text-red-400 text-sm mt-2">{error}</p>} */}
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
