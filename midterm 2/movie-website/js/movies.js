const apiKey = "983db06f56c86e4a1e14851e14254229";
const apiUrl = "https://api.themoviedb.org/3";
const imgPath = "https://image.tmdb.org/t/p/w1280";

const moviesContainer = document.querySelector(".list-items-container");
const categories = document.querySelector("#select-category");
const form = document.querySelector("form");
const search = form.querySelector("input");
let timeoutId = null;

const menuOpen = document.querySelector(".burger");
const menuClose = document.querySelector(".close");
const overlay = document.querySelector(".overlay");

menuOpen.addEventListener("click", () => {
  overlay.classList.add("overlay-active");
});

menuClose.addEventListener("click", () => {
  overlay.classList.remove("overlay-active");
});

// First request
getMovies(`${apiUrl}/movie/now_playing?&language=en-US&&api_key=${apiKey}`);

async function getMovies(url) {
  const res = await fetch(url);
  const respData = await res.json();

  showMovies(respData.results);
}

function showMovies(movies) {
  moviesContainer.innerHTML = "";
  movies.forEach((movie) => {
    const { poster_path, title, vote_average, release_date, id } = movie;
    const movieEl = document.createElement("div");
    movieEl.classList.add("list-item");
    movieEl.innerHTML = `
          <img class="list-item-image" src="${
            imgPath + poster_path
          }" alt="${title}" />
          <div class="list-item-details">
            <a class="item-title" href="details.html?movie_id=${id}">${title}</a>
            <div class="list-item-details-year-rating">
              <div class="flex">
                <h5>${formatDate(release_date)}</h5>
                <img src="/images/tmdb.svg" alt="TMDB" />
              </div>
              <h5 class="${getClassByRate(vote_average)}">${(
      Math.round(vote_average * 100) / 100
    ).toFixed(1)}</h5>
            </div>
          </div>
        `;
    moviesContainer.appendChild(movieEl);
  });
}

// ON SUBMIT
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const searchTerm = search.value;
  const searchUrl = `${apiUrl}/search/movie?&api_key=${apiKey}&query=${searchTerm}`;

  if (searchTerm) {
    getMovies(searchUrl);
    search.value = "";
  }
});

// ON CHANGE
categories.addEventListener("change", () => {
  var value = categories.options[categories.selectedIndex].value;
  getMovies(
    `${apiUrl}/movie/${value}?language=en-US&page=${
      value === "upcoming" ? "2" : "1"
    }&api_key=${apiKey}`
  );
});

// Suggestions container
const suggestionsContainer = document.createElement("div");
suggestionsContainer.className = "search-suggestions";
form.appendChild(suggestionsContainer);

search.addEventListener("input", (e) => {
  clearTimeout(timeoutId);
  const searchTerm = e.target.value.trim();

  if (searchTerm.length < 2) {
    suggestionsContainer.style.display = "none";
    return;
  }

  // Debounce API calls
  timeoutId = setTimeout(() => {
    getSuggestions(searchTerm);
  }, 300);
});

// Hide suggestions when clicking outside
document.addEventListener("click", (e) => {
  if (!form.contains(e.target)) {
    suggestionsContainer.style.display = "none";
  }
});

async function getSuggestions(searchTerm) {
  try {
    const response = await fetch(
      `${apiUrl}/search/movie?api_key=${apiKey}&query=${searchTerm}&language=en-US&page=1`
    );
    const data = await response.json();

    // First 7 results
    const suggestions = data.results.slice(0, 7);

    if (suggestions.length > 0) {
      displaySuggestions(suggestions);
    } else {
      suggestionsContainer.style.display = "none";
    }
  } catch (error) {
    console.error("Error fetching suggestions:", error);
  }
}

function displaySuggestions(suggestions) {
  suggestionsContainer.innerHTML = "";

  suggestions.forEach((movie) => {
    const { poster_path, title, release_date, id } = movie;
    const year = release_date ? new Date(release_date).getFullYear() : "";

    const suggestionEl = document.createElement("div");
    suggestionEl.className = "suggestion-item";
    suggestionEl.innerHTML = `
      <img 
        class="suggestion-poster" 
        src="${poster_path ? imgPath + poster_path : "/images/no-poster.png"}" 
        alt="${title}"
      />
      <div class="suggestion-info">
        <div class="suggestion-title">${title}</div>
        ${year ? `<div class="suggestion-year">${year}</div>` : ""}
      </div>
    `;

    suggestionEl.addEventListener("click", () => {
      window.location.href = `details.html?movie_id=${id}`;
    });

    suggestionsContainer.appendChild(suggestionEl);
  });

  suggestionsContainer.style.display = "block";
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getClassByRate(vote) {
  if (vote >= 8) {
    return "green";
  } else if (vote > 5) {
    return "orange";
  } else {
    return "red";
  }
}

function addToWatchlist(name, description, image) {
  let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

  if (!watchlist.some((movie) => movie.name === name)) {
    watchlist.push({ name, description, image });

    localStorage.setItem("watchlist", JSON.stringify(watchlist));
    alert(`${name} has been added to your watchlist!`);
  } else {
    alert(`${name} is already in your watchlist.`);
  }
}

let slideIndex = 1;
window.plusSlides = (n) => {
  showSlides((slideIndex += n));
};

window.currentSlide = (n) => {
  showSlides((slideIndex = n));
};

const showSlides = (n) => {
  let i;
  let slides = document.getElementsByClassName("mySlides");
  let dots = document.getElementsByClassName("dot");
  if (n > slides.length) {
    slideIndex = 1;
  }
  if (n < 1) {
    slideIndex = slides.length;
  }
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex - 1].style.display = "block";
};

showSlides(slideIndex);

// Run every 3 seconds
setInterval(() => plusSlides(1), 3000);
