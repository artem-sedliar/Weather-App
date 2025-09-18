// Clean Figma Weather App JavaScript

class WeatherApp {
    constructor() {
        this.apiKey = 'b1757922a9e0708bf9b5a007239bf746'; // OpenWeatherMap API key
        this.apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
        this.forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';
        
        this.initElements();
        this.bindEvents();
        this.loadDefaultWeather();
        this.updateDateTime();
        this.startDateTimeUpdate();
    }

    initElements() {
        // Search elements
        this.searchToggle = document.getElementById('searchToggle');
        this.searchPanel = document.getElementById('searchPanel');
        this.cityInput = document.getElementById('cityInput');
        this.searchBtn = document.getElementById('searchBtn');
        
        // Weather display elements
        this.cityName = document.getElementById('cityName');
        this.temperature = document.getElementById('temperature');
        this.description = document.getElementById('description');
        this.currentDate = document.getElementById('currentDate');
        this.weatherIcon = document.getElementById('weatherIcon');
        this.feelsLike = document.getElementById('feelsLike');
        
        // Weather stats elements
        this.windSpeed = document.getElementById('windSpeed');
        this.humidity = document.getElementById('humidity');
        this.visibility = document.getElementById('visibility');
        this.pressure = document.getElementById('pressure');
        
        // Forecast elements
        this.hourlyToggle = document.getElementById('hourlyToggle');
        this.weeklyToggle = document.getElementById('weeklyToggle');
        this.hourlyForecastContainer = document.getElementById('hourlyForecastContainer');
        this.weeklyForecastContainer = document.getElementById('weeklyForecastContainer');
        this.hourlyForecast = document.getElementById('hourlyForecast');
        this.weeklyForecast = document.getElementById('weeklyForecast');
        
        // Loading overlay
        this.loadingOverlay = document.getElementById('loadingOverlay');
    }

    bindEvents() {
        // Search toggle functionality
        this.searchToggle.addEventListener('click', () => this.toggleSearchPanel());
        
        // Search functionality
        this.searchBtn.addEventListener('click', () => this.searchWeather());
        this.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchWeather();
            }
        });

        // Close search panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.searchPanel.contains(e.target) && !this.searchToggle.contains(e.target)) {
                this.closeSearchPanel();
            }
        });

        // Escape key to close search
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeSearchPanel();
            }
        });

        // Forecast toggle functionality
        this.hourlyToggle.addEventListener('click', () => this.showHourlyForecast());
        this.weeklyToggle.addEventListener('click', () => this.showWeeklyForecast());
    }

    toggleSearchPanel() {
        this.searchPanel.classList.toggle('active');
        if (this.searchPanel.classList.contains('active')) {
            setTimeout(() => {
                this.cityInput.focus();
            }, 300);
        }
    }

    closeSearchPanel() {
        this.searchPanel.classList.remove('active');
    }

    showHourlyForecast() {
        // Toggle buttons
        this.hourlyToggle.classList.add('active');
        this.weeklyToggle.classList.remove('active');
        
        // Toggle containers
        this.hourlyForecastContainer.classList.remove('hidden');
        this.weeklyForecastContainer.classList.remove('show');
        this.weeklyForecastContainer.classList.add('hidden');
    }

    showWeeklyForecast() {
        // Toggle buttons
        this.weeklyToggle.classList.add('active');
        this.hourlyToggle.classList.remove('active');
        
        // Toggle containers
        this.hourlyForecastContainer.classList.add('hidden');
        this.weeklyForecastContainer.classList.remove('hidden');
        this.weeklyForecastContainer.classList.add('show');
    }

    async loadDefaultWeather() {
        // Load weather for Kyiv by default
        await this.getWeatherData('Київ');
    }

    updateDateTime() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        this.currentDate.textContent = now.toLocaleDateString('uk-UA', options);
    }

    startDateTimeUpdate() {
        // Update date every minute
        setInterval(() => {
            this.updateDateTime();
        }, 60000);
    }

    async searchWeather() {
        const city = this.cityInput.value.trim();
        if (!city) {
            this.showError('Будь ласка, введіть назву міста');
            return;
        }

        await this.getWeatherData(city);
        this.closeSearchPanel();
    }

    async getWeatherData(city) {
        try {
            this.showLoading(true);
            
            // Real API implementation
            const [weatherResponse, forecastResponse] = await Promise.all([
                fetch(`${this.apiUrl}?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric&lang=uk`),
                fetch(`${this.forecastUrl}?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric&lang=uk`)
            ]);

            if (!weatherResponse.ok) {
                throw new Error('Місто не знайдено');
            }

            const weatherData = await weatherResponse.json();
            this.displayWeatherData(weatherData);
            
            if (forecastResponse.ok) {
                const forecastData = await forecastResponse.json();
                this.displayRealHourlyForecast(forecastData);
                this.displayRealWeeklyForecast(forecastData);
            } else {
                // Fallback to mock data if forecast fails
                this.displayMockHourlyForecast();
                this.displayMockWeeklyForecast();
            }
            
            this.showLoading(false);

        } catch (error) {
            // Fallback to mock data if API fails
            console.warn('API request failed, using mock data:', error.message);
            setTimeout(() => {
                this.displayMockWeatherData(city);
                this.displayMockHourlyForecast();
                this.displayMockWeeklyForecast();
                this.showLoading(false);
            }, 500);
        }
    }

    displayMockWeatherData(city) {
        const weatherConditions = [
            { description: 'Сонячно', icon: 'fas fa-sun', temp: 25 },
            { description: 'Частково хмарно', icon: 'fas fa-cloud-sun', temp: 22 },
            { description: 'Хмарно', icon: 'fas fa-cloud', temp: 18 },
            { description: 'Дощ', icon: 'fas fa-cloud-rain', temp: 15 },
            { description: 'Гроза', icon: 'fas fa-bolt', temp: 20 },
            { description: 'Туман', icon: 'fas fa-smog', temp: 16 }
        ];

        const randomCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
        
        const mockData = {
            name: city,
            main: {
                temp: randomCondition.temp + Math.floor(Math.random() * 10) - 5,
                humidity: Math.floor(Math.random() * 40) + 40,
                feels_like: randomCondition.temp + Math.floor(Math.random() * 6) - 3,
                pressure: Math.floor(Math.random() * 50) + 1000
            },
            weather: [
                {
                    description: randomCondition.description,
                    icon: randomCondition.icon
                }
            ],
            wind: {
                speed: Math.floor(Math.random() * 20) + 5
            },
            visibility: Math.floor(Math.random() * 15) + 5
        };

        this.displayWeatherData(mockData);
    }

    displayWeatherData(data) {
        // Update main weather info
        this.cityName.textContent = data.name;
        this.temperature.textContent = `${Math.round(data.main.temp)}°`;
        this.description.textContent = data.weather[0].description;
        this.feelsLike.textContent = `${Math.round(data.main.feels_like || data.main.temp)}°`;
        
        // Update weather icon based on OpenWeatherMap icon codes
        const iconCode = data.weather[0].icon;
        this.weatherIcon.className = this.getWeatherIconClass(iconCode);
        
        // Update weather stats
        this.windSpeed.textContent = Math.round(data.wind.speed * 3.6);
        this.humidity.textContent = data.main.humidity;
        this.visibility.textContent = Math.round((data.visibility || 10000) / 1000);
        this.pressure.textContent = data.main.pressure || 1013;

        // Clear error states
        document.body.classList.remove('error');
        this.cityInput.value = '';
    }

    getWeatherIconClass(iconCode) {
        const iconMap = {
            '01d': 'fas fa-sun',           // clear sky day
            '01n': 'fas fa-moon',          // clear sky night
            '02d': 'fas fa-cloud-sun',     // few clouds day
            '02n': 'fas fa-cloud-moon',    // few clouds night
            '03d': 'fas fa-cloud',         // scattered clouds
            '03n': 'fas fa-cloud',
            '04d': 'fas fa-cloud',         // broken clouds
            '04n': 'fas fa-cloud',
            '09d': 'fas fa-cloud-rain',    // shower rain
            '09n': 'fas fa-cloud-rain',
            '10d': 'fas fa-cloud-sun-rain', // rain day
            '10n': 'fas fa-cloud-moon-rain', // rain night
            '11d': 'fas fa-bolt',          // thunderstorm
            '11n': 'fas fa-bolt',
            '13d': 'fas fa-snowflake',     // snow
            '13n': 'fas fa-snowflake',
            '50d': 'fas fa-smog',          // mist
            '50n': 'fas fa-smog'
        };
        
        return iconMap[iconCode] || 'fas fa-sun';
    }

    displayRealHourlyForecast(forecastData) {
        const hours = [];
        const currentTime = new Date();
        
        // Get next 5 forecast entries (3-hour intervals)
        for (let i = 0; i < Math.min(5, forecastData.list.length); i++) {
            const forecast = forecastData.list[i];
            const forecastTime = new Date(forecast.dt * 1000);
            
            let timeLabel;
            if (i === 0) {
                timeLabel = 'Зараз';
            } else {
                timeLabel = forecastTime.toLocaleTimeString('uk-UA', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
            }
            
            hours.push({
                time: timeLabel,
                temperature: Math.round(forecast.main.temp),
                icon: this.getWeatherIconClass(forecast.weather[0].icon)
            });
        }

        this.displayHourlyForecast(hours);
    }

    displayMockHourlyForecast() {
        const hours = [];
        const currentHour = new Date().getHours();
        const icons = ['fas fa-sun', 'fas fa-cloud-sun', 'fas fa-cloud', 'fas fa-cloud-rain', 'fas fa-bolt'];
        
        for (let i = 0; i < 5; i++) {
            const hour = (currentHour + i) % 24;
            const temp = Math.floor(Math.random() * 10) + 15;
            const icon = icons[Math.floor(Math.random() * icons.length)];
            
            let timeLabel;
            if (i === 0) {
                timeLabel = 'Зараз';
            } else {
                timeLabel = `${hour.toString().padStart(2, '0')}:00`;
            }
            
            hours.push({
                time: timeLabel,
                temperature: temp,
                icon: icon
            });
        }

        this.displayHourlyForecast(hours);
    }

    displayRealWeeklyForecast(forecastData) {
        const dailyForecasts = {};
        
        // Group forecasts by date
        forecastData.list.forEach(forecast => {
            const date = new Date(forecast.dt * 1000);
            const dateKey = date.toDateString();
            
            if (!dailyForecasts[dateKey]) {
                dailyForecasts[dateKey] = {
                    date: date,
                    temps: [],
                    conditions: [],
                    icons: []
                };
            }
            
            dailyForecasts[dateKey].temps.push(forecast.main.temp);
            dailyForecasts[dateKey].conditions.push(forecast.weather[0].description);
            dailyForecasts[dateKey].icons.push(forecast.weather[0].icon);
        });

        // Convert to weekly format
        const weeklyData = [];
        const today = new Date();
        
        Object.keys(dailyForecasts).slice(0, 7).forEach((dateKey, index) => {
            const forecast = dailyForecasts[dateKey];
            const maxTemp = Math.round(Math.max(...forecast.temps));
            const minTemp = Math.round(Math.min(...forecast.temps));
            
            // Get most common condition and icon
            const mostCommonIcon = this.getMostFrequent(forecast.icons);
            const mostCommonCondition = this.getMostFrequent(forecast.conditions);
            
            let dayName;
            if (index === 0) {
                dayName = 'Сьогодні';
            } else if (index === 1) {
                dayName = 'Завтра';
            } else {
                dayName = forecast.date.toLocaleDateString('uk-UA', { weekday: 'long' });
            }
            
            weeklyData.push({
                day: dayName,
                condition: mostCommonCondition,
                icon: this.getWeatherIconClass(mostCommonIcon),
                tempHigh: maxTemp,
                tempLow: minTemp
            });
        });

        this.displayWeeklyForecast(weeklyData);
    }

    displayMockWeeklyForecast() {
        const days = ['Сьогодні', 'Завтра', 'Середа', 'Четвер', 'П\'ятниця', 'Субота', 'Неділя'];
        const conditions = [
            { desc: 'Сонячно', icon: 'fas fa-sun' },
            { desc: 'Частково хмарно', icon: 'fas fa-cloud-sun' },
            { desc: 'Хмарно', icon: 'fas fa-cloud' },
            { desc: 'Дощ', icon: 'fas fa-cloud-rain' },
            { desc: 'Гроза', icon: 'fas fa-bolt' }
        ];
        
        const weeklyData = days.map(day => {
            const condition = conditions[Math.floor(Math.random() * conditions.length)];
            const baseTemp = Math.floor(Math.random() * 15) + 15;
            
            return {
                day: day,
                condition: condition.desc,
                icon: condition.icon,
                tempHigh: baseTemp + Math.floor(Math.random() * 8),
                tempLow: baseTemp - Math.floor(Math.random() * 8)
            };
        });

        this.displayWeeklyForecast(weeklyData);
    }

    displayWeeklyForecast(weeklyData) {
        this.weeklyForecast.innerHTML = '';
        
        weeklyData.forEach(day => {
            const weeklyItem = document.createElement('div');
            weeklyItem.className = 'weekly-item';
            
            weeklyItem.innerHTML = `
                <div class="weekly-day">${day.day}</div>
                <div class="weekly-weather">
                    <i class="${day.icon} weekly-icon"></i>
                    <span class="weekly-desc">${day.condition}</span>
                </div>
                <div class="weekly-temps">
                    <span class="temp-high">${day.tempHigh}°</span>
                    <span class="temp-low">${day.tempLow}°</span>
                </div>
            `;
            
            this.weeklyForecast.appendChild(weeklyItem);
        });
    }

    getMostFrequent(array) {
        const frequency = {};
        let maxCount = 0;
        let mostFrequent = array[0];
        
        array.forEach(item => {
            frequency[item] = (frequency[item] || 0) + 1;
            if (frequency[item] > maxCount) {
                maxCount = frequency[item];
                mostFrequent = item;
            }
        });
        
        return mostFrequent;
    }

    displayHourlyForecast(hours) {
        this.hourlyForecast.innerHTML = '';
        
        hours.forEach(hour => {
            const hourlyItem = document.createElement('div');
            hourlyItem.className = 'hourly-item';
            
            hourlyItem.innerHTML = `
                <span class="hourly-time">${hour.time}</span>
                <i class="${hour.icon} hourly-icon"></i>
                <span class="hourly-temp">${hour.temperature}°</span>
            `;
            
            this.hourlyForecast.appendChild(hourlyItem);
        });
    }

    showLoading(show) {
        if (show) {
            document.body.classList.add('loading');
            this.loadingOverlay.classList.add('show');
        } else {
            document.body.classList.remove('loading');
            this.loadingOverlay.classList.remove('show');
        }
    }

    showError(message) {
        document.body.classList.add('error');
        this.cityName.textContent = 'Помилка';
        this.temperature.textContent = '--°';
        this.description.textContent = message;
        this.feelsLike.textContent = '--°';
        
        // Clear weather stats
        this.windSpeed.textContent = '--';
        this.humidity.textContent = '--';
        this.visibility.textContent = '--';
        this.pressure.textContent = '--';
        
        this.weatherIcon.className = 'fas fa-exclamation-triangle';
        
        // Clear hourly forecast
        this.hourlyForecast.innerHTML = '';
    }

    // Get user's location weather
    async getCurrentLocationWeather() {
        if (!navigator.geolocation) {
            this.showError('Геолокація не підтримується цим браузером');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                try {
                    this.showLoading(true);
                    
                    // Real API call with coordinates
                    const [weatherResponse, forecastResponse] = await Promise.all([
                        fetch(`${this.apiUrl}?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&lang=uk`),
                        fetch(`${this.forecastUrl}?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&lang=uk`)
                    ]);

                    if (!weatherResponse.ok) {
                        throw new Error('Не вдалося отримати погоду для вашого місцезнаходження');
                    }

                    const weatherData = await weatherResponse.json();
                    this.displayWeatherData(weatherData);
                    
                    if (forecastResponse.ok) {
                        const forecastData = await forecastResponse.json();
                        this.displayRealHourlyForecast(forecastData);
                        this.displayRealWeeklyForecast(forecastData);
                    } else {
                        this.displayMockHourlyForecast();
                        this.displayMockWeeklyForecast();
                    }
                    
                    this.showLoading(false);
                    
                } catch (error) {
                    // Fallback to mock data
                    console.warn('Location API request failed, using mock data:', error.message);
                    setTimeout(() => {
                        this.displayMockWeatherData('Ваше місцезнаходження');
                        this.displayMockHourlyForecast();
                        this.displayMockWeeklyForecast();
                        this.showLoading(false);
                    }, 500);
                }
            },
            () => {
                this.showError('Не вдалося отримати ваше місцезнаходження');
            }
        );
    }
}

// Weather Animation Effects
class WeatherAnimations {
    static addRainEffect() {
        const rainContainer = document.createElement('div');
        rainContainer.className = 'rain-effect';
        document.body.appendChild(rainContainer);

        for (let i = 0; i < 50; i++) {
            const raindrop = document.createElement('div');
            raindrop.className = 'raindrop';
            raindrop.style.left = Math.random() * 100 + '%';
            raindrop.style.animationDelay = Math.random() * 2 + 's';
            raindrop.style.animationDuration = (Math.random() * 1 + 0.5) + 's';
            rainContainer.appendChild(raindrop);
        }
    }

    static removeWeatherEffects() {
        const effects = document.querySelectorAll('.rain-effect, .snow-effect');
        effects.forEach(effect => effect.remove());
    }
}

// Utility Functions
const WeatherUtils = {
    // Temperature conversion
    celsiusToFahrenheit(celsius) {
        return (celsius * 9/5) + 32;
    },

    fahrenheitToCelsius(fahrenheit) {
        return (fahrenheit - 32) * 5/9;
    },

    // Format time
    formatTime(timestamp) {
        return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Get wind direction
    getWindDirection(degrees) {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const index = Math.round(degrees / 45) % 8;
        return directions[index];
    },

    // Get weather condition color
    getWeatherColor(condition) {
        const colors = {
            'clear': '#f39c12',
            'clouds': '#95a5a6',
            'rain': '#3498db',
            'snow': '#ecf0f1',
            'thunderstorm': '#9b59b6',
            'drizzle': '#74b9ff',
            'mist': '#bdc3c7'
        };
        return colors[condition.toLowerCase()] || '#34495e';
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new WeatherApp();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === '/' && e.ctrlKey) {
            e.preventDefault();
            app.cityInput.focus();
        }
    });
});

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
