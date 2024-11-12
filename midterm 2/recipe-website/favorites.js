const apiKey = "b5347fc6b089496887ed2ce2f554169d";

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

const favoritesList = document.getElementById("favorites-list");

function removeFavorite(recipeId) {
  // Remove recipe from favorites array
  favorites = favorites.filter((recipe) => recipe.id !== recipeId);

  // Update local storage
  localStorage.setItem("favorites", JSON.stringify(favorites));

  // Immediately update the displayed list
  displayFavorites();
}

async function displayFavorites() {
  favoritesList.innerHTML = ""; // Clear the list first

  if (favorites.length === 0) {
    favoritesList.innerHTML = "<p>No favorite recipes added yet.</p>";
  } else {
    favorites.forEach(async (recipe) => {
      const recipeItem = document.createElement("div");
      recipeItem.className = "recipe-item";

      const recipeTitle = document.createElement("h3");
      recipeTitle.textContent = recipe.title;

      const recipeImage = document.createElement("img");
      recipeImage.src = recipe.image;
      recipeImage.alt = recipe.title;

      const recipeLink = document.createElement("a");
      recipeLink.href = "#";
      recipeLink.textContent = "View Recipe";
      recipeLink.className = "view-recipe";

      recipeLink.onclick = async function () {
        await showRecipeDetails(recipe.id);
      };

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
      // Create Remove button
      const removeButton = document.createElement("button");
      removeButton.textContent = "Remove";
      removeButton.className = "remove";

      removeButton.onclick = function () {
        removeFavorite(recipe.id); // Remove the recipe when clicked
      };

      recipeItem.appendChild(recipeImage);
      recipeItem.appendChild(recipeTitle);
      recipeItem.appendChild(prepTimeElement);
      recipeItem.appendChild(recipeLink);
      recipeItem.appendChild(removeButton); // Add Remove button to the card

      favoritesList.appendChild(recipeItem);
    });
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

// Display the favorite recipes on page load
displayFavorites();
