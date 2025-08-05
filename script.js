// Variables globales
let data = {
    movies: [],
    series: []
};

let movieServerCount = 0;
let seasonCount = 0;
let currentEditItem = null;
let currentEditType = null;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    addMovieServer();
    updateContent();
    generateRawUrl();
});

// Funciones de navegación por tabs
function showTab(tabName) {
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    contents.forEach(content => content.classList.remove('active'));
    
    document.querySelector(`[onclick="showTab('${tabName}')"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');
    
    if (tabName === 'content') {
        updateContent();
    }
}

// Funciones para cargar y guardar datos
function loadData() {
    const savedData = localStorage.getItem('genZenitData');
    if (savedData) {
        try {
            data = JSON.parse(savedData);
        } catch (e) {
            console.error('Error al cargar datos:', e);
        }
    }
    
    // Cargar configuración
    const savedConfig = localStorage.getItem('genZenitConfig');
    if (savedConfig) {
        try {
            const config = JSON.parse(savedConfig);
            if (config.jsonFileName) document.getElementById('jsonFileName').value = config.jsonFileName;
            if (config.autoUpdate !== undefined) document.getElementById('autoUpdate').checked = config.autoUpdate;
        } catch (e) {
            console.error('Error al cargar configuración:', e);
        }
    }
}

function saveData() {
    localStorage.setItem('genZenitData', JSON.stringify(data));
    updateContent();
    
    if (document.getElementById('autoUpdate').checked) {
        showToast('Datos guardados automáticamente', 'success', 1500);
    }
}

function saveConfig() {
    const config = {
        jsonFileName: document.getElementById('jsonFileName').value,
        autoUpdate: document.getElementById('autoUpdate').checked
    };
    localStorage.setItem('genZenitConfig', JSON.stringify(config));
}

// Event listeners para configuración
document.getElementById('jsonFileName').addEventListener('input', saveConfig);
document.getElementById('autoUpdate').addEventListener('change', saveConfig);

// Funciones para películas
function addMovieServer() {
    movieServerCount++;
    const serversContainer = document.getElementById('movieServers');
    const serverDiv = document.createElement('div');
    serverDiv.className = 'server-item';
    serverDiv.innerHTML = `
        <div class="server-row">
            <div class="form-group">
                <label>Servidor</label>
                <select class="movie-server-name">
                    <option value="">Seleccionar servidor</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Google Drive">Google Drive</option>
                    <option value="OneDrive">OneDrive</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Dropbox">Dropbox</option>
                    <option value="TeraBox">TeraBox</option>
                    <option value="MEGA">MEGA</option>
                    <option value="Mediafire">Mediafire</option>
                    <option value="Streamtape">Streamtape</option>
                    <option value="Doodstream">Doodstream</option>
                </select>
            </div>
            <div class="form-group">
                <label>URL</label>
                <input type="url" class="movie-server-url" placeholder="https://...">
            </div>
            <div class="form-group">
                <label>Idioma</label>
                <select class="movie-server-language">
                    <option value="Español">Español</option>
                    <option value="Inglés">Inglés</option>
                    <option value="Inglés (Sub Español)">Inglés (Sub Español)</option>
                    <option value="Portugués">Portugués</option>
                    <option value="Francés">Francés</option>
                    <option value="Italiano">Italiano</option>
                </select>
            </div>
            <div class="form-group">
                <label>Calidad</label>
                <select class="movie-server-quality">
                    <option value="HD">HD</option>
                    <option value="Full HD">Full HD</option>
                    <option value="4K">4K</option>
                    <option value="SD">SD</option>
                    <option value="720p">720p</option>
                    <option value="1080p">1080p</option>
                </select>
            </div>
            <div class="form-group">
                <button class="btn btn-danger" onclick="this.parentElement.parentElement.parentElement.remove()">Eliminar</button>
            </div>
        </div>
    `;
    serversContainer.appendChild(serverDiv);
}

function addMovie() {
    const title = document.getElementById('movieTitle').value;
    const year = document.getElementById('movieYear').value;
    const genre = document.getElementById('movieGenre').value;
    const director = document.getElementById('movieDirector').value;
    const duration = document.getElementById('movieDuration').value;
    const rating = document.getElementById('movieRating').value;
    const synopsis = document.getElementById('movieSynopsis').value;
    const poster = document.getElementById('moviePoster').value;
    const trailer = document.getElementById('movieTrailer').value;

    if (!title) {
        showToast('Por favor, ingresa el título de la película', 'error');
        return;
    }

    const servers = [];
    const serverItems = document.querySelectorAll('#movieServers .server-item');
    serverItems.forEach(item => {
        const serverName = item.querySelector('.movie-server-name').value;
        const serverUrl = item.querySelector('.movie-server-url').value;
        const serverLanguage = item.querySelector('.movie-server-language').value;
        const serverQuality = item.querySelector('.movie-server-quality').value;
        
        if (serverName && serverUrl) {
            servers.push({
                name: serverName,
                url: serverUrl,
                language: serverLanguage,
                quality: serverQuality
            });
        }
    });

    const movie = {
        id: Date.now(),
        title,
        year: parseInt(year) || new Date().getFullYear(),
        genre,
        director,
        duration: parseInt(duration) || 0,
        rating,
        synopsis,
        poster,
        trailer,
        servers,
        dateAdded: new Date().toISOString()
    };

    data.movies.push(movie);
    clearMovieForm();
    saveData();
    showToast('Película agregada exitosamente', 'success');
    showTab('content');
}

function clearMovieForm() {
    document.getElementById('movieTitle').value = '';
    document.getElementById('movieYear').value = '';
    document.getElementById('movieGenre').value = '';
    document.getElementById('movieDirector').value = '';
    document.getElementById('movieDuration').value = '';
    document.getElementById('movieRating').value = '';
    document.getElementById('movieSynopsis').value = '';
    document.getElementById('moviePoster').value = '';
    document.getElementById('movieTrailer').value = '';
    document.getElementById('movieServers').innerHTML = '';
    movieServerCount = 0;
    addMovieServer();
}

// Funciones para series
function addSeason() {
    seasonCount++;
    const seasonsContainer = document.getElementById('seasonsContainer');
    const seasonDiv = document.createElement('div');
    seasonDiv.className = 'season-item';
    seasonDiv.innerHTML = `
        <div class="season-header">
            <div class="season-title">Temporada ${seasonCount}</div>
            <button class="btn btn-danger" onclick="this.parentElement.parentElement.remove()">Eliminar Temporada</button>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Número de Temporada</label>
                <input type="number" class="season-number" value="${seasonCount}" min="1">
            </div>
            <div class="form-group">
                <label>Año</label>
                <input type="number" class="season-year" placeholder="2024">
            </div>
        </div>
        <div class="form-group">
            <label>Descripción de la Temporada</label>
            <textarea class="season-description" placeholder="Descripción opcional de la temporada"></textarea>
        </div>
        <h4 style="margin: 15px 0; color: #b3d9ff;">Episodios</h4>
        <div class="episodes-container"></div>
        <div class="add-section">
            <button class="btn btn-secondary" onclick="addEpisode(this)">+ Agregar Episodio</button>
        </div>
    `;
    seasonsContainer.appendChild(seasonDiv);
}

function addEpisode(button) {
    const episodesContainer = button.parentElement.previousElementSibling;
    const episodeCount = episodesContainer.children.length + 1;
    const episodeDiv = document.createElement('div');
    episodeDiv.className = 'episode-item';
    episodeDiv.innerHTML = `
        <div class="episode-header">
            <h5>Episodio ${episodeCount}</h5>
            <button class="btn btn-danger" onclick="this.parentElement.parentElement.remove()">Eliminar</button>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Número</label>
                <input type="number" class="episode-number" value="${episodeCount}" min="1">
            </div>
            <div class="form-group">
                <label>Título</label>
                <input type="text" class="episode-title" placeholder="Título del episodio">
            </div>
            <div class="form-group">
                <label>Duración (min)</label>
                <input type="number" class="episode-duration" placeholder="45">
            </div>
        </div>
        <div class="form-group">
            <label>Sinopsis</label>
            <textarea class="episode-synopsis" placeholder="Descripción del episodio"></textarea>
        </div>
        <h5 style="margin: 15px 0; color: #b3d9ff;">Servidores del Episodio</h5>
        <div class="episode-servers"></div>
        <button class="btn btn-secondary" onclick="addEpisodeServer(this)">+ Agregar Servidor</button>
    `;
    episodesContainer.appendChild(episodeDiv);
}

function addEpisodeServer(button) {
    const serversContainer = button.previousElementSibling;
    const serverDiv = document.createElement('div');
    serverDiv.className = 'server-item';
    serverDiv.innerHTML = `
        <div class="server-row">
            <div class="form-group">
                <label>Servidor</label>
                <select class="episode-server-name">
                    <option value="">Seleccionar servidor</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Google Drive">Google Drive</option>
                    <option value="OneDrive">OneDrive</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Dropbox">Dropbox</option>
                    <option value="TeraBox">TeraBox</option>
                    <option value="MEGA">MEGA</option>
                    <option value="Mediafire">Mediafire</option>
                    <option value="Streamtape">Streamtape</option>
                    <option value="Doodstream">Doodstream</option>
                </select>
            </div>
            <div class="form-group">
                <label>URL</label>
                <input type="url" class="episode-server-url" placeholder="https://...">
            </div>
            <div class="form-group">
                <label>Idioma</label>
                <select class="episode-server-language">
                    <option value="Español">Español</option>
                    <option value="Inglés">Inglés</option>
                    <option value="Inglés (Sub Español)">Inglés (Sub Español)</option>
                    <option value="Portugués">Portugués</option>
                    <option value="Francés">Francés</option>
                    <option value="Italiano">Italiano</option>
                </select>
            </div>
            <div class="form-group">
                <label>Calidad</label>
                <select class="episode-server-quality">
                    <option value="HD">HD</option>
                    <option value="Full HD">Full HD</option>
                    <option value="4K">4K</option>
                    <option value="SD">SD</option>
                    <option value="720p">720p</option>
                    <option value="1080p">1080p</option>
                </select>
            </div>
            <div class="form-group">
                <button class="btn btn-danger" onclick="this.parentElement.parentElement.remove()">Eliminar</button>
            </div>
        </div>
    `;
    serversContainer.appendChild(serverDiv);
}

function addSeries() {
    const title = document.getElementById('seriesTitle').value;
    const year = document.getElementById('seriesYear').value;
    const genre = document.getElementById('seriesGenre').value;
    const creator = document.getElementById('seriesCreator').value;
    const status = document.getElementById('seriesStatus').value;
    const rating = document.getElementById('seriesRating').value;
    const synopsis = document.getElementById('seriesSynopsis').value;
    const poster = document.getElementById('seriesPoster').value;
    const trailer = document.getElementById('seriesTrailer').value;

    if (!title) {
        showToast('Por favor, ingresa el título de la serie', 'error');
        return;
    }

    const seasons = [];
    const seasonItems = document.querySelectorAll('#seasonsContainer .season-item');
    
    seasonItems.forEach(seasonItem => {
        const seasonNumber = seasonItem.querySelector('.season-number').value;
        const seasonYear = seasonItem.querySelector('.season-year').value;
        const seasonDescription = seasonItem.querySelector('.season-description').value;
        
        const episodes = [];
        const episodeItems = seasonItem.querySelectorAll('.episode-item');
        
        episodeItems.forEach(episodeItem => {
            const episodeNumber = episodeItem.querySelector('.episode-number').value;
            const episodeTitle = episodeItem.querySelector('.episode-title').value;
            const episodeDuration = episodeItem.querySelector('.episode-duration').value;
            const episodeSynopsis = episodeItem.querySelector('.episode-synopsis').value;
            
            const episodeServers = [];
            const episodeServerItems = episodeItem.querySelectorAll('.episode-servers .server-item');
            
            episodeServerItems.forEach(serverItem => {
                const serverName = serverItem.querySelector('.episode-server-name').value;
                const serverUrl = serverItem.querySelector('.episode-server-url').value;
                const serverLanguage = serverItem.querySelector('.episode-server-language').value;
                const serverQuality = serverItem.querySelector('.episode-server-quality').value;
                
                if (serverName && serverUrl) {
                    episodeServers.push({
                        name: serverName,
                        url: serverUrl,
                        language: serverLanguage,
                        quality: serverQuality
                    });
                }
            });
            
            if (episodeNumber && episodeTitle) {
                episodes.push({
                    number: parseInt(episodeNumber),
                    title: episodeTitle,
                    duration: parseInt(episodeDuration) || 0,
                    synopsis: episodeSynopsis,
                    servers: episodeServers
                });
            }
        });
        
        if (seasonNumber) {
            seasons.push({
                number: parseInt(seasonNumber),
                year: parseInt(seasonYear) || new Date().getFullYear(),
                description: seasonDescription,
                episodes: episodes.sort((a, b) => a.number - b.number)
            });
        }
    });

    const series = {
        id: Date.now(),
        title,
        year: parseInt(year) || new Date().getFullYear(),
        genre,
        creator,
        status,
        rating,
        synopsis,
        poster,
        trailer,
        seasons: seasons.sort((a, b) => a.number - b.number),
        dateAdded: new Date().toISOString()
    };

    data.series.push(series);
    clearSeriesForm();
    saveData();
    showToast('Serie agregada exitosamente', 'success');
    showTab('content');
}

function clearSeriesForm() {
    document.getElementById('seriesTitle').value = '';
    document.getElementById('seriesYear').value = '';
    document.getElementById('seriesGenre').value = '';
    document.getElementById('seriesCreator').value = '';
    document.getElementById('seriesStatus').value = 'En emisión';
    document.getElementById('seriesRating').value = '';
    document.getElementById('seriesSynopsis').value = '';
    document.getElementById('seriesPoster').value = '';
    document.getElementById('seriesTrailer').value = '';
    document.getElementById('seasonsContainer').innerHTML = '';
    seasonCount = 0;
}

// Funciones para mostrar contenido
function updateContent() {
    updateStats();
    displayMovies();
    displaySeries();
    updateSettingsInfo();
}

function updateStats() {
    const movieCount = data.movies.length;
    const seriesCount = data.series.length;
    let episodeCount = 0;
    let serverCount = 0;
    
    data.movies.forEach(movie => {
        serverCount += movie.servers.length;
    });
    
    data.series.forEach(series => {
        series.seasons.forEach(season => {
            episodeCount += season.episodes.length;
            season.episodes.forEach(episode => {
                serverCount += episode.servers.length;
            });
        });
    });
    
    document.getElementById('movieCount').textContent = movieCount;
    document.getElementById('seriesCount').textContent = seriesCount;
    document.getElementById('episodeCount').textContent = episodeCount;
    document.getElementById('serverCount').textContent = serverCount;
}

function displayMovies() {
    const moviesList = document.getElementById('moviesList');
    
    if (data.movies.length === 0) {
        moviesList.innerHTML = `
            <div class="empty-state">
                <p>No hay películas agregadas</p>
                <button class="btn" onclick="showTab('movies')">Agregar Primera Película</button>
            </div>
        `;
        return;
    }
    
    moviesList.innerHTML = data.movies.map(movie => `
        <div class="content-item">
            <div class="item-header">
                <div>
                    <div class="item-title">${movie.title}</div>
                    <div class="item-meta">
                        <span>📅 ${movie.year}</span>
                        <span>🎭 ${movie.genre}</span>
                        <span>🎬 ${movie.director}</span>
                        <span>⏱️ ${movie.duration} min</span>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="btn btn-small" onclick="editMovie(${movie.id})">✏️ Editar</button>
                    <button class="btn btn-small btn-danger" onclick="deleteMovie(${movie.id})">🗑️ Eliminar</button>
                </div>
            </div>
            <div class="item-synopsis">${movie.synopsis || 'Sin sinopsis'}</div>
            <div class="item-servers">
                ${movie.servers.map(server => `
                    <span class="server-tag">${server.name} - ${server.language} (${server.quality})</span>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function displaySeries() {
    const seriesList = document.getElementById('seriesList');
    
    if (data.series.length === 0) {
        seriesList.innerHTML = `
            <div class="empty-state">
                <p>No hay series agregadas</p>
                <button class="btn" onclick="showTab('series')">Agregar Primera Serie</button>
            </div>
        `;
        return;
    }
    
    seriesList.innerHTML = data.series.map(series => `
        <div class="content-item">
            <div class="item-header">
                <div>
                    <div class="item-title">${series.title}</div>
                    <div class="item-meta">
                        <span>📅 ${series.year}</span>
                        <span>🎭 ${series.genre}</span>
                        <span>👤 ${series.creator}</span>
                        <span>📊 ${series.status}</span>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="btn btn-small" onclick="editSeries(${series.id})">✏️ Editar</button>
                    <button class="btn btn-small btn-danger" onclick="deleteSeries(${series.id})">🗑️ Eliminar</button>
                </div>
            </div>
            <div class="item-synopsis">${series.synopsis || 'Sin sinopsis'}</div>
            <div class="series-seasons">
                ${series.seasons.map(season => `
                    <div class="season-item">
                        <div class="season-header">
                            <span class="season-title">Temporada ${season.number} (${season.year})</span>
                            <button class="btn btn-small" onclick="editSeason(${series.id}, ${season.number})">✏️ Editar Temporada</button>
                        </div>
                        <div class="episodes-list">
                            ${season.episodes.map(episode => `
                                <div class="episode-item">
                                    <strong>Ep. ${episode.number}</strong>: ${episode.title}
                                    <br><small>${episode.servers.length} servidor(es)</small>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// Funciones de edición
function editMovie(id) {
    const movie = data.movies.find(m => m.id === id);
    if (!movie) return;
    
    currentEditItem = movie;
    currentEditType = 'movie';
    
    // Llenar formulario con datos existentes
    document.getElementById('movieTitle').value = movie.title;
    document.getElementById('movieYear').value = movie.year;
    document.getElementById('movieGenre').value = movie.genre;
    document.getElementById('movieDirector').value = movie.director;
    document.getElementById('movieDuration').value = movie.duration;
    document.getElementById('movieRating').value = movie.rating;
    document.getElementById('movieSynopsis').value = movie.synopsis;
    document.getElementById('moviePoster').value = movie.poster;
    document.getElementById('movieTrailer').value = movie.trailer;
    
    // Limpiar servidores y agregar los existentes
    document.getElementById('movieServers').innerHTML = '';
    movieServerCount = 0;
    
    movie.servers.forEach(server => {
        addMovieServer();
        const lastServer = document.querySelector('#movieServers .server-item:last-child');
        lastServer.querySelector('.movie-server-name').value = server.name;
        lastServer.querySelector('.movie-server-url').value = server.url;
        lastServer.querySelector('.movie-server-language').value = server.language;
        lastServer.querySelector('.movie-server-quality').value = server.quality;
    });
    
    if (movie.servers.length === 0) {
        addMovieServer();
    }
    
    showTab('movies');
    showToast('Editando película: ' + movie.title, 'info');
}

function editSeries(id) {
    const series = data.series.find(s => s.id === id);
    if (!series) return;
    
    currentEditItem = series;
    currentEditType = 'series';
    
    // Llenar formulario con datos existentes
    document.getElementById('seriesTitle').value = series.title;
    document.getElementById('seriesYear').value = series.year;
    document.getElementById('seriesGenre').value = series.genre;
    document.getElementById('seriesCreator').value = series.creator;
    document.getElementById('seriesStatus').value = series.status;
    document.getElementById('seriesRating').value = series.rating;
    document.getElementById('seriesSynopsis').value = series.synopsis;
    document.getElementById('seriesPoster').value = series.poster;
    document.getElementById('seriesTrailer').value = series.trailer;
    
    // Reconstruir temporadas y episodios
    document.getElementById('seasonsContainer').innerHTML = '';
    seasonCount = 0;
    
    series.seasons.forEach(season => {
        addSeason();
        const lastSeason = document.querySelector('#seasonsContainer .season-item:last-child');
        lastSeason.querySelector('.season-number').value = season.number;
        lastSeason.querySelector('.season-year').value = season.year;
        lastSeason.querySelector('.season-description').value = season.description;
        
        const episodesContainer = lastSeason.querySelector('.episodes-container');
        season.episodes.forEach(episode => {
            const addEpisodeBtn = lastSeason.querySelector('.add-section button');
            addEpisode(addEpisodeBtn);
            
            const lastEpisode = episodesContainer.querySelector('.episode-item:last-child');
            lastEpisode.querySelector('.episode-number').value = episode.number;
            lastEpisode.querySelector('.episode-title').value = episode.title;
            lastEpisode.querySelector('.episode-duration').value = episode.duration;
            lastEpisode.querySelector('.episode-synopsis').value = episode.synopsis;
            
            const serversContainer = lastEpisode.querySelector('.episode-servers');
            episode.servers.forEach(server => {
                const addServerBtn = lastEpisode.querySelector('button[onclick*="addEpisodeServer"]');
                addEpisodeServer(addServerBtn);
                
                const lastServer = serversContainer.querySelector('.server-item:last-child');
                lastServer.querySelector('.episode-server-name').value = server.name;
                lastServer.querySelector('.episode-server-url').value = server.url;
                lastServer.querySelector('.episode-server-language').value = server.language;
                lastServer.querySelector('.episode-server-quality').value = server.quality;
            });
        });
    });
    
    showTab('series');
    showToast('Editando serie: ' + series.title, 'info');
}

// Funciones de eliminación
function deleteMovie(id) {
    const movie = data.movies.find(m => m.id === id);
    if (!movie) return;
    
    if (confirm(`¿Estás seguro de eliminar la película "${movie.title}"?`)) {
        data.movies = data.movies.filter(m => m.id !== id);
        saveData();
        showToast('Película eliminada', 'success');
    }
}

function deleteSeries(id) {
    const series = data.series.find(s => s.id === id);
    if (!series) return;
    
    if (confirm(`¿Estás seguro de eliminar la serie "${series.title}"?`)) {
        data.series = data.series.filter(s => s.id !== id);
        saveData();
        showToast('Serie eliminada', 'success');
    }
}

// Funciones de configuración y utilidades
function updateSettingsInfo() {
    const now = new Date();
    document.getElementById('lastUpdate').textContent = now.toLocaleString();
    
    const jsonSize = (JSON.stringify(data).length / 1024).toFixed(2);
    document.getElementById('fileSize').textContent = jsonSize + ' KB';
    
    let totalServers = 0;
    data.movies.forEach(movie => totalServers += movie.servers.length);
    data.series.forEach(series => {
        series.seasons.forEach(season => {
            season.episodes.forEach
