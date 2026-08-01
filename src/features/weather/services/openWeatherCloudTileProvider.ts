import type { CloudTileProvider } from "../types";

class OpenWeatherCloudTileProvider implements CloudTileProvider {
  readonly id = "openweather-clouds-new";
  readonly name = "OpenWeather — Clouds New";
  readonly attribution =
    'Weather data © <a href="https://openweathermap.org/" target="_blank">OpenWeather</a>';
  readonly tileSize = 256;
  readonly maxZoom = 12;

  getTileUrl(): string {
    return "/api/weather/clouds/{z}/{x}/{y}";
  }
}

export const cloudTileProvider: CloudTileProvider = new OpenWeatherCloudTileProvider();
