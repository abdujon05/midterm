const apiKey = "b5347fc6b089496887ed2ce2f554169d";
const apiUrl = "https://api.spoonacular.com/recipes/complexSearch?&number=10";
const form = document.querySelector("form");
const input = document.querySelector("input");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  searchRecipes();
  input.value = "";
});

// Load favorites from local storage
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

async function searchRecipes() {
  const searchQuery = document.getElementById("query").value;
  try {
    const response = await fetch(
      `${apiUrl}&apiKey=${apiKey}&query=${searchQuery}`
    );
    const data = await response.json();
    const recipeList = document.getElementById("results");
    recipeList.innerHTML = "";

    if (data.results.length === 0) {
      recipeList.innerHTML = "No recipes found.";
    } else {
      data.results.forEach(async (recipe) => {
        const recipeItem = document.createElement("div");
        recipeItem.className = "recipe-item";

        const recipeTitle = document.createElement("h3");
        recipeTitle.textContent = recipe.title;

        const recipeImage = document.createElement("img");
        recipeImage.src = recipe.image;
        recipeImage.alt = recipe.title;

        let prepTime;

        try {
          const detailsResponse = await fetch(
            `https://api.spoonacular.com/recipes/${recipe.id}/information?apiKey=${apiKey}`
          );
          const detailsData = await detailsResponse.json();

          prepTime = detailsData.readyInMinutes;
        } catch (error) {
          console.error("Error fetching preparation time:", error);
          prepTime = "N/A"; // Default value if there's an error
        }

        const prepTimeElement = document.createElement("p");
        prepTimeElement.textContent = `Prep time: ${prepTime} minutes`;

        const recipeLink = document.createElement("a");
        recipeLink.href = "#";
        recipeLink.textContent = "View Recipe";
        recipeLink.className = "view-recipe";

        recipeLink.onclick = async function () {
          await showRecipeDetails(recipe.id);
        };

        const favoriteButton = document.createElement("button");
        favoriteButton.textContent = "Add to Favorites";
        favoriteButton.className = "add-to-favorites";
        favoriteButton.onclick = function () {
          addToFavorites(recipe);
        };

        recipeItem.appendChild(recipeImage);
        recipeItem.appendChild(recipeTitle);
        recipeItem.appendChild(prepTimeElement);
        recipeItem.appendChild(recipeLink);
        recipeItem.appendChild(favoriteButton);
        recipeList.appendChild(recipeItem);
      });
    }
  } catch (error) {
    console.error("Error fetching recipes:", error);
  }
}

function addToFavorites(recipe) {
  const existingRecipe = favorites.find((fav) => fav.id === recipe.id);
  if (!existingRecipe) {
    favorites.push(recipe);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    alert(`${recipe.title} has been added to your favorites!`);
  } else {
    alert(`${recipe.title} is already in your favorites.`);
  }
}
async function showRecipeDetails(recipeId) {
  const recipeDetailsDiv = document.getElementById("recipe-details");
  const recipeContentDiv = document.getElementById("recipe-content");
  try {
    const response = await fetch(
      `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`
    );
    const recipeData = await response.json();
    recipeContentDiv.innerHTML = `
      <h2>${recipeData.title}</h2>
      <img src="${recipeData.image}" alt="${recipeData.title}">
      <p><strong>Ingredients:</strong> ${recipeData.extendedIngredients
        .map((ingredient) => ingredient.original)
        .join(", ")}</p>
      <p><strong>Instructions:</strong> ${recipeData.instructions}</p>
      `;
    recipeDetailsDiv.style.display = "flex";
  } catch (error) {
    console.error("Error fetching recipe details:", error);
  }
}
function closeRecipeDetails() {
  const recipeDetailsDiv = document.getElementById("recipe-details");
  recipeDetailsDiv.style.display = "none";
}
