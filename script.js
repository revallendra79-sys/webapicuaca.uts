// ==========================================================
// 1. Konfigurasi Awal
// ==========================================================
const API_KEY = "b2f489630e812c6d7babe9a0ba93dfe2"; // *** GANTI DENGAN KUNCI API ANDA ***
const BASE_URL = "https://api.openweathermap.org/data/2.5/";
let currentCity = "Bojonegoro"; // Kota default

// Element DOM
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const themeToggle = document.getElementById('theme-toggle');
const weatherDataEl = document.getElementById('weather-data');
const forecastContainer = document.querySelector('.forecast-container');
const lastUpdatedEl = document.getElementById('last-updated');

// ==========================================================
// 2. Fungsi Utama Pengambilan Data
// ==========================================================

/**
 * Mengambil data cuaca saat ini dari OpenWeatherMap.
 * @param {string} city - Nama kota yang akan dicari.
 */
async function fetchWeatherData(city) {
    const currentWeatherUrl = `${BASE_URL}weather?q=${city}&units=metric&appid=${API_KEY}`;
    const forecastUrl = `${BASE_URL}forecast?q=${city}&units=metric&appid=${API_KEY}`;

    try {
        // Tampilkan pesan loading
        weatherDataEl.innerHTML = '<p class="loading-message">Mengambil data cuaca...</p>';
        forecastContainer.innerHTML = '<p class="loading-message">Mengambil prakiraan...</p>';

        const [weatherResponse, forecastResponse] = await Promise.all([
            fetch(currentWeatherUrl),
            fetch(forecastUrl)
        ]);

        if (!weatherResponse.ok) {
            throw new Error('Kota tidak ditemukan atau terjadi masalah API cuaca.');
        }

        const weatherData = await weatherResponse.json();
        const forecastData = await forecastResponse.json();

        // Update UI
        displayWeatherData(weatherData);
        displayForecast(forecastData);
        updateLastUpdated();

    } catch (error) {
        console.error("Gagal mengambil data cuaca:", error);
        weatherDataEl.innerHTML = `<p class="loading-message error">Gagal memuat data: ${error.message}</p>`;
        forecastContainer.innerHTML = `<p class="loading-message error">Gagal memuat prakiraan: ${error.message}</p>`;
    }
}

// ==========================================================
// 3. Fungsi Tampilan Data (Rendering)
// ==========================================================

/**
 * Mengonversi kode ikon cuaca OpenWeatherMap ke ikon Font Awesome.
 * @param {string} iconCode - Kode ikon dari API.
 * @returns {string} - Kelas ikon Font Awesome.
 */
function getWeatherIcon(iconCode) {
    const iconMap = {
        '01d': 'fas fa-sun',       // clear sky
        '01n': 'fas fa-moon',
        '02d': 'fas fa-cloud-sun', // few clouds
        '02n': 'fas fa-cloud-moon',
        '03d': 'fas fa-cloud',     // scattered clouds
        '03n': 'fas fa-cloud',
        '04d': 'fas fa-cloud-meatball', // broken clouds
        '04n': 'fas fa-cloud-meatball',
        '09d': 'fas fa-cloud-showers-heavy', // shower rain
        '09n': 'fas fa-cloud-showers-heavy',
        '10d': 'fas fa-cloud-sun-rain', // rain
        '10n': 'fas fa-cloud-moon-rain',
        '11d': 'fas fa-bolt',      // thunderstorm
        '11n': 'fas fa-bolt',
        '13d': 'fas fa-snowflake', // snow
        '13n': 'fas fa-snowflake',
        '50d': 'fas fa-smog',      // mist
        '50n': 'fas fa-smog'
    };
    // Menggunakan ikon default jika kode tidak ditemukan
    return iconMap[iconCode] || 'fas fa-question-circle';
}


/**
 * Menampilkan data cuaca saat ini ke DOM.
 * @param {object} data - Data cuaca dari API.
 */
function displayWeatherData(data) {
    const temp = Math.round(data.main.temp);
    const feelsLike = Math.round(data.main.feels_like);
    const description = data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1);
    const iconClass = getWeatherIcon(data.weather[0].icon);

    weatherDataEl.innerHTML = `
        <div class="main-info">
            <h2>${data.name}, ${data.sys.country}</h2>
            <i class="icon ${iconClass}"></i>
            <p class="temperature">${temp}°C</p>
            <p>${description}</p>
        </div>

        <div class="data-grid">
            <div class="detail-card">
                <i class="fas fa-temperature-three-quarters"></i>
                <p>Terasa Seperti</p>
                <p class="value">${feelsLike}°C</p>
            </div>
            <div class="detail-card">
                <i class="fas fa-tint"></i>
                <p>Kelembaban</p>
                <p class="value">${data.main.humidity}%</p>
            </div>
            <div class="detail-card">
                <i class="fas fa-wind"></i>
                <p>Kecepatan Angin</p>
                <p class="value">${data.wind.speed} m/s</p>
            </div>
            <div class="detail-card">
                <i class="fas fa-tachometer-alt"></i>
                <p>Tekanan</p>
                <p class="value">${data.main.pressure} hPa</p>
            </div>
            <div class="detail-card">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Awan</p>
                <p class="value">${data.clouds.all}%</p>
            </div>
            <div class="detail-card">
                <i class="fas fa-eye"></i>
                <p>Jarak Pandang</p>
                <p class="value">${(data.visibility / 1000).toFixed(1)} km</p>
            </div>
        </div>
    `;
}

/**
 * Menampilkan prakiraan suhu 24 jam (8 titik data per 3 jam) ke DOM.
 * @param {object} data - Data prakiraan dari API.
 */
function displayForecast(data) {
    let forecastHTML = '';
    // Ambil 8 item pertama (prakiraan 24 jam ke depan, 8 * 3 jam)
    const next24Hours = data.list.slice(0, 8);

    next24Hours.forEach(item => {
        const time = new Date(item.dt * 1000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        const temp = Math.round(item.main.temp);
        const iconClass = getWeatherIcon(item.weather[0].icon);

        forecastHTML += `
            <div class="forecast-item">
                <p class="time">${time}</p>
                <i class="${iconClass}" style="font-size: 1.5em; margin: 5px 0;"></i>
                <p class="temp">${temp}°C</p>
            </div>
        `;
    });

    forecastContainer.innerHTML = forecastHTML;
}

/**
 * Memperbarui tampilan waktu terakhir diperbarui.
 */
function updateLastUpdated() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    lastUpdatedEl.textContent = `Terakhir diperbarui: ${timeString}`;
}

// ==========================================================
// 4. Fitur Tema Gelap/Terang
// ==========================================================

/**
 * Mengatur tema berdasarkan preferensi yang tersimpan di localStorage.
 */
function setupTheme() {
    // Cek preferensi yang tersimpan
    const savedTheme = localStorage.getItem('theme');
    const isDarkMode = savedTheme === 'dark';

    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>'; // Ikon matahari untuk beralih ke terang
    } else {
        document.body.classList.remove('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>'; // Ikon bulan untuk beralih ke gelap
    }
}

/**
 * Mengganti tema dan menyimpan preferensi.
 */
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');

    // Simpan preferensi
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');

    // Update ikon
    themeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

// ==========================================================
// 5. Inisialisasi dan Event Listeners
// ==========================================================

// Event Listener untuk tombol cari
searchBtn.addEventListener('click', () => {
    const newCity = cityInput.value.trim();
    if (newCity) {
        currentCity = newCity;
        fetchWeatherData(currentCity);
    }
});

// Event Listener untuk input (tekan Enter)
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

// Event Listener untuk tombol toggle tema
themeToggle.addEventListener('click', toggleTheme);


// 6. Jalankan saat halaman dimuat
setupTheme();
fetchWeatherData(currentCity); // Ambil data awal

// 7. Auto Refresh (Setiap 10 detik)
setInterval(() => {
    console.log(`[Auto Refresh] Memperbarui data untuk ${currentCity}...`);
    fetchWeatherData(currentCity);
}, 10000); // 10000 ms = 10 detik