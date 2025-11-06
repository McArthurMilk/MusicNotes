const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const resultsDiv = document.getElementById("results");
const journalDiv = document.getElementById("journal");


async function getSpotifyToken() {
  const res = await fetch("/.netlify/functions/getSpotifyToken");
  const data = await res.json();
  return data.access_token;
}

async function searchSpotify(query) {
  const token = await getSpotifyToken();
  const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  const data = await response.json();
  displayResults(data.tracks.items);
}

function displayResults(tracks) {
  resultsDiv.innerHTML = "";
  tracks.forEach(track => {
    const div = document.createElement("div");
    div.classList.add("result");
    div.innerHTML = `
      <img src="${track.album.images[0].url}" width="64" height="64">
      <div>
        <strong>${track.name}</strong><br>
        ${track.artists.map(a => a.name).join(", ")}<br>
        <em>${track.album.name}</em>
      </div>
      <button class="selectBtn">Select</button>
    `;
    div.querySelector(".selectBtn").addEventListener("click", () => selectSong(track));
    resultsDiv.appendChild(div);
  });
}

function selectSong(track) {
  const song = track.name;
  const artist = track.artists.map(a => a.name).join(", ");
  const albumArt = track.album.images[0].url;
  const preview = track.preview_url || "No preview available";

  const entry = {
    song,
    artist,
    date: new Date().toLocaleDateString(),
    notes: "",
    albumArt,
    preview
  };

  const entries = JSON.parse(localStorage.getItem("musicJournal")) || [];
  entries.push(entry);
  localStorage.setItem("musicJournal", JSON.stringify(entries));

  loadEntries();
  resultsDiv.innerHTML = "";
  searchInput.value = "";
}

searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query) searchSpotify(query);
});

function loadEntries() {
  const entries = JSON.parse(localStorage.getItem("musicJournal")) || [];
  journalDiv.innerHTML = "";
  entries.forEach(entry => {
    const div = document.createElement("div");
    div.classList.add("entry");
    div.innerHTML = `
      <h3>${entry.song} - ${entry.artist}</h3>
      <p><strong>Date:</strong> ${entry.date}</p>
      ${entry.albumArt ? `<img src="${entry.albumArt}" width="100">` : ""}
      ${entry.preview && entry.preview !== "No preview available" ? `
        <audio controls src="${entry.preview}"></audio>
      ` : `<p><em>${entry.preview}</em></p>`}
      <hr>
    `;
    journalDiv.appendChild(div);
  });
}

window.onload = loadEntries;
