const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const resultsDiv = document.getElementById("results");
const journalDiv = document.getElementById("journal");

const saveEntry = document.getElementByID("saveBtn");


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

let selectedEntry = null; // holds the song user selected
let entries = JSON.parse(localStorage.getItem("musicJournal")) || [];

// SELECT SONG
function selectSong(track) {
  const song = track.name;
  const artist = track.artists.map(a => a.name).join(", ");
  const albumArt = track.album.images[0].url;
  const preview = track.preview_url || "No preview available";

  selectedEntry = {
    song,
    artist,
    date: new Date().toLocaleDateString(),
    notes: "",
    albumArt,
    preview
  };

  // Show selected song info on screen
  document.getElementById("selected-song").innerHTML = `
    <div class="selected-song">
      <img src="${albumArt}" width="100">
      <h3>${song}</h3>
      <p>${artist}</p>
      <audio controls src="${preview}"></audio>
      <textarea id="notes" placeholder="Write your thoughts here..."></textarea>
      <button id="saveEntry">Save Entry</button>
    </div>
  `;

  resultsDiv.innerHTML = ""; // clear search results
  searchInput.value = "";

  // Attach event to the "Save Entry" button dynamically
  document.getElementById("saveEntry").addEventListener("click", saveEntry);
}

// SAVE ENTRY
function saveEntry() {
  const notes = document.getElementById("notes").value.trim();
  if (!selectedEntry) return alert("Please select a song first!");

  selectedEntry.notes = notes;
  entries.push(selectedEntry);
  localStorage.setItem("musicJournal", JSON.stringify(entries));

  alert("Entry saved!");
  selectedEntry = null;
  document.getElementById("selected-song").innerHTML = "";
  loadEntries();
}

function loadEntries() {
  const journalDiv = document.getElementById("journal");
  journalDiv.innerHTML = "";

  entries.forEach(entry => {
    const div = document.createElement("div");
    div.classList.add("entry");
    div.innerHTML = `
      <img src="${entry.albumArt}" width="80">
      <h4>${entry.song}</h4>
      <p><strong>${entry.artist}</strong> — ${entry.date}</p>
      <p>${entry.notes}</p>
      <audio controls src="${entry.preview}"></audio>
    `;
    journalDiv.appendChild(div);
  });
}

// SEARCH BUTTON
searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query) searchSpotify(query);
});

// Load previous entries on page load
loadEntries();

window.onload = loadEntries;
