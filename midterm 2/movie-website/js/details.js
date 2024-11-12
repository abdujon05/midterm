const apiKey = "983db06f56c86e4a1e14851e14254229";
const apiUrl = "https://api.themoviedb.org/3";
const imgPath = "https://image.tmdb.org/t/p/w1280";

const urlParams = new URLSearchParams(window.location.search);
const movieDb = urlParams.get("movie_id");
const apiUrlMovie = `${apiUrl}/movie/${movieDb}?language=en-US&api_key=${apiKey}`;
const apiUrlActors = `${apiUrl}/movie/${movieDb}/credits?language=en-US&api_key=${apiKey}`;

getMovie();

export function formatDate(date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getClassByRate(vote) {
  if (vote >= 8) {
    return "green";
  } else if (vote > 5) {
    return "orange";
  } else {
    return "red";
  }
}

export function addToWatchlist(name, description, image) {
  let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

  if (!watchlist.some((movie) => movie.name === name)) {
    watchlist.push({ name, description, image });

    localStorage.setItem("watchlist", JSON.stringify(watchlist));
    alert(`${name} has been added to your watchlist!`);
  } else {
    alert(`${name} is already in your watchlist.`);
  }
}

async function getMovie() {
  const resMovie = await fetch(apiUrlMovie);
  const resultMovie = await resMovie.json();

  const resActors = await fetch(apiUrlActors);
  const resultActor = await resActors.json();

  showMovie(resultMovie);
  showActors(resultActor.cast);
}

function showMovie(movie) {
  const {
    budget,
    poster_path,
    genres,
    title,
    overview,
    revenue,
    release_date,
    vote_average,
  } = movie;
  const detailsContainer = document.querySelector(".details-content");

  const genresMarkup = genres
    .map((genre) => `<div class="genre-box">${genre.name}</div>`)
    .join("");

  detailsContainer.innerHTML = `
      <img src="${imgPath + poster_path}" alt="details" />
      <div class="details-image-right">
        <div class="details-image-right-top">
          <h1>${title}</h1>
          <i class="fa-regular fa-star">
            <span class="${getClassByRate(vote_average)}">${(
    Math.round(vote_average * 100) / 100
  ).toFixed(1)}</span>
          </i>
        </div>
        <p id="details-overview">${overview}</p>
        <h2>Genres</h2>
        <div class="details-genres-container">
          <div class="details-genres">
           ${genresMarkup}
          </div>
        </div>
        <h2>Details</h2>
        <p><strong>Budget:</strong> $${budget.toLocaleString()}</p>
        <p><strong>Revenue:</strong> $${revenue.toLocaleString()}</p>
        <p><strong>Release Date:</strong> ${formatDate(release_date)}</p>

        <button class="genre-box" id="save">
          <i class="fa-solid fa-floppy-disk"></i> Save
        </button>
      </div>
  `;

  detailsContainer.querySelector("#save").addEventListener("click", () => {
    addToWatchlist(title, overview, poster_path);
  });
}

function showActors(actors) {
  const actorsContainer = document.querySelector(".actors-scroll");

  actors.forEach((actor) => {
    const { name, character, profile_path } = actor;
    const actorElement = document.createElement("div");
    actorElement.classList.add("actors-card");

    actorElement.innerHTML = `
      <div class="crop-container">
        <img src="${imgPath + profile_path}" />
      </div>
      <div class="card-details">
        <p>${character}</p>
        <p>${name}</p>
      </div>
    `;
    actorsContainer.appendChild(actorElement);
  });
}
