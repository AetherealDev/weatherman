const weatherKey = "22610f53872df2f987e227b29eb8866d";

// Clear local storage
localStorage.clear();

// Function to find a city's weather
function findCity() {
  var cityName = titleCase($("#cityName")[0].value.trim());

  var apiURL =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    cityName +
    "&units=imperial&appid=" +
    weatherKey;

  // Fetch the weather data for the city
  fetch(apiURL).then(function (response) {
    if (response.ok) {
      response.json().then(function (data) {
        // Update the city name and current date
        $("#city-name")[0].textContent =
          cityName + " (" + moment().format("M/D/YYYY") + ")";

        // Add the city to the list
        $("#city-list").append(
          '<button type="button" class="list-group-item list-group-item-light list-group-item-action city-name">' +
            cityName
        );

        const lat = data.coord.lat;
        const lon = data.coord.lon;

        var latLonPair = lat.toString() + " " + lon.toString();

        // Store the city's coordinates in local storage
        localStorage.setItem(cityName, latLonPair);

        apiURL =
          "https://api.openweathermap.org/data/2.5/onecall?lat=" +
          lat +
          "&lon=" +
          lon +
          "&exclude=minutely,hourly&units=imperial&appid=" +
          weatherKey;

        // Fetch the weather forecast for the city
        fetch(apiURL).then(function (newResponse) {
          if (newResponse.ok) {
            newResponse.json().then(function (newData) {
              getCurrentWeather(newData);
            });
          }
        });
      });
    } else {
      alert("Cannot find city!");
    }
  });
}

// Function to get weather for a city already in the list
function getListCity(coordinates) {
  apiURL =
    "https://api.openweathermap.org/data/2.5/onecall?lat=" +
    coordinates[0] +
    "&lon=" +
    coordinates[1] +
    "&exclude=minutely,hourly&units=imperial&appid=" +
    weatherKey;

  // Fetch the weather data for the city
  fetch(apiURL).then(function (response) {
    if (response.ok) {
      response.json().then(function (data) {
        getCurrentWeather(data);
      });
    }
  });
}

// Function to display the current weather
function getCurrentWeather(data) {
  $(".results-panel").addClass("visible");

  // Update the current weather information
  $("#currentIcon")[0].src =
    "http://openweathermap.org/img/wn/" +
    data.current.weather[0].icon +
    "@2x.png";
  $("#temperature")[0].textContent =
    "Temperature: " + data.current.temp.toFixed(1) + " \u2109";
  $("#humidity")[0].textContent =
    "Humidity: " + data.current.humidity + "% ";
  $("#wind-speed")[0].textContent =
    "Wind Speed: " + data.current.wind_speed.toFixed(1) + " MPH";
  $("#uv-index")[0].textContent = "  " + data.current.uvi;

  // Set UV index class based on severity
  if (data.current.uvi < 3) {
    $("#uv-index").removeClass("moderate severe");
    $("#uv-index").addClass("favorable");
  } else if (data.current.uvi < 6) {
    $("#uv-index").removeClass("favorable severe");
    $("#uv-index").addClass("moderate");
  } else {
    $("#uv-index").removeClass("favorable moderate");
    $("#uv-index").addClass("severe");
  }

  getFutureWeather(data);
}

// Function to display the future weather forecast
function getFutureWeather(data) {
  for (var i = 0; i < 5; i++) {
    var futureWeather = {
      date: convertUnixTime(data, i),
      icon:
        "http://openweathermap.org/img/wn/" +
        data.daily[i + 1].weather[0].icon +
        "@2x.png",
      temp: data.daily[i + 1].temp.day.toFixed(1),
      humidity: data.daily[i + 1].humidity,
    };

    // Update the future weather forecast for each day
    var currentSelector = "#day-" + i;
    $(currentSelector)[0].textContent = futureWeather.date;
    currentSelector = "#img-" + i;
    $(currentSelector)[0].src = futureWeather.icon;
    currentSelector = "#temp-" + i;
    $(currentSelector)[0].textContent =
      "Temp: " + futureWeather.temp + " \u2109";
    currentSelector = "#hum-" + i;
    $(currentSelector)[0].textContent =
      "Humidity: " + futureWeather.humidity + "%";
  }
}

// Function to apply title case to a city name
function titleCase(city) {
  var updatedCity = city.toLowerCase().split(" ");
  var returnedCity = "";
  for (var i = 0; i < updatedCity.length; i++) {
    updatedCity[i] = updatedCity[i][0].toUpperCase() + updatedCity[i].slice(1);
    returnedCity += " " + updatedCity[i];
  }
  return returnedCity;
}

// Function to convert UNIX time to a readable date format
function convertUnixTime(data, index) {
  const dateObject = new Date(data.daily[index + 1].dt * 1000);
  return dateObject.toLocaleDateString();
}

// Event listener for search button click
$("#search-button").on("click", function (e) {
  e.preventDefault();
  findCity();
  $("form")[0].reset();
});

// Event listener for city list click
$(".city-list-box").on("click", ".city-name", function () {
  var coordinates = localStorage.getItem($(this)[0].textContent).split(" ");
  coordinates[0] = parseFloat(coordinates[0]);
  coordinates[1] = parseFloat(coordinates[1]);

  // Update the selected city name and date
  $("#city-name")[0].textContent =
    $(this)[0].textContent + " (" + moment().format("M/D/YYYY") + ")";

  getListCity(coordinates);
});
