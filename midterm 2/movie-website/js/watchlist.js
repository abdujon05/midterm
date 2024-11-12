const imgPath = "https://image.tmdb.org/t/p/w1280";

document.addEventListener("DOMContentLoaded", () => {
  let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
  let watchlistContainer = document.getElementById("watchlist-container");

  watchlistContainer.innerHTML = `
        <div class="watchlist-table-header">
            <div>Image</div>
            <div>Title</div>
            <div>Description</div>
            <div>Action</div>
        </div>
    `;

  if (watchlist.length === 0) {
    watchlistContainer.innerHTML =
      "<p>Your watchlist is empty. Start adding some movies!</p>";
    return;
  }

  watchlist.forEach((movie, index) => {
    let movieRow = document.createElement("div");
    movieRow.classList.add("movie-row");

    let img = document.createElement("img");
    img.src = `${imgPath + movie.image}`;
    img.alt = movie.name;

    let title = document.createElement("h3");
    title.textContent = movie.name;

    let desc = document.createElement("p");
    desc.textContent = movie.description;

    let removeButton = document.createElement("button");
    removeButton.classList.add("remove-button");
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => {
      removeMovieFromWatchlist(index);
    });

    movieRow.appendChild(img);
    movieRow.appendChild(title);
    movieRow.appendChild(desc);
    movieRow.appendChild(removeButton);

    watchlistContainer.appendChild(movieRow);
  });
});

function removeMovieFromWatchlist(index) {
  let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
  watchlist.splice(index, 1);
  localStorage.setItem("watchlist", JSON.stringify(watchlist));
  location.reload();
}
