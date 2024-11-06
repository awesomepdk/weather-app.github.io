import { useEffect, useRef, useState } from "react";
import CurrentWeather from "./components/CurrentWeather";
import HourlyWeatherItem from "./components/HourlyWeatherItem";
import SearchSection from "./components/SearchSection";
import { weatherCodes } from "./constants";
import NoResultsDiv from "./components/NoResultsDiv";

const App = () => {
  const API_KEY = import.meta.env.VITE_API_KEY;
  const [currentWeather, setCurrentWeather] = useState({});
  const [hourlyForecasts, setHourlyForecasts] = useState([]);
  const [hasNoResults, setHasNoResults] = useState(false);
  const searchInputRef = useRef(null);

  const filterHourlyForecast = (hourlyData) => {
    const currentHour = new Date().setMinutes(0,0,0);
    const next24Hours = currentHour + 24 * 60 * 60 * 1000;

    const next24HoursData = hourlyData.filter(({time}) => {
      const forecastTime = new Date(time).getTime();
      return forecastTime >= currentHour && forecastTime <= next24Hours;
    });

    setHourlyForecasts(next24HoursData);
  };

  const getWeatherDetails = async (API_URL) => {
    setHasNoResults(false);
    window.innerWidth <= 768 && searchInputRef.current.focus();
    try {
      const response = await fetch(API_URL);
      if(!response.ok) throw new Error();
      const data = await response.json();
      
      const temperature = Math.floor(data.current.temp_f);
      const description = data.current.condition.text;
      const weatherIcon = Object.keys(weatherCodes).find((icon) => weatherCodes[icon].includes(data.current.condition.code));

      setCurrentWeather({ temperature, description, weatherIcon });

      const combinedHourlyData = [...data.forecast.forecastday[0].hour, ...data.forecast.forecastday[1].hour];

      searchInputRef.current.value = data.location.name;
      filterHourlyForecast(combinedHourlyData);
    } catch {
      // Set setHasNoResults state if there's an error
      setHasNoResults(true);
    }
  };
// Default City
  useEffect(() => {
    const defaultCity = "New York";
    const API_URL = `http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${defaultCity}&days=2`;
    getWeatherDetails(API_URL);
  }, []);

  return (
  <div className="container">
      {/* Search Section */}
      <SearchSection getWeatherDetails={getWeatherDetails} searchInputRef={searchInputRef}/>

      {/* Conditionall render based on hasNoResults state */}

      {hasNoResults ? (
        <NoResultsDiv />
      ) : (
      <div className="weather-section">
        {/* Current weather */}
        <CurrentWeather currentWeather={currentWeather} />

        {/* Hourly Weather Forecast List */}
        <div className="hourly-forecast">
          <ul className="weather-list">
            {hourlyForecasts.map((hourlyWeather) => (
              <HourlyWeatherItem key={hourlyWeather.time_epoch} hourlyWeather={hourlyWeather} />
            ))}
          </ul>
        </div>
      </div>
      )}
    </div>
  );
};

export default App;