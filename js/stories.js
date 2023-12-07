"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, needsDeleteButton = false) {
  // console.debug("generateStoryMarkup", story);
  //getHostName will retrieve a new URL based on the url for the story
  const hostName = story.getHostName();

  return $(`
      <li id="${story.storyId}">
        <div>
        ${needsDeleteButton ? getDeleteButton() : ""}
        ${currentUser ? getStarHTML(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small><br>
        <small class="story-author">by ${story.author}</small><br>
        <small class="story-user">posted by ${story.username}</small>
        </div>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** Handle submitting new story form. */

async function submitNewStory(evt) {
  console.debug("submitNewStory");
  evt.preventDefault();

  // grab all info from form
  const title = $title.val();
  const url = $url.val();
  const author = $author.val();
  const username = currentUser.username;
  const storyData = { title, url, author, username };

  const story = await storyList.addStory(currentUser, storyData);

  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);

  // hide the form and reset it
  $submitForm.trigger("reset");
}

$submitForm.on("submit", submitNewStory);

/******************************************************************************
 * Connects the functions from models.js in User._addOrRemoveFavs to the User Interface favorites sections of the app
 * Puts the stories from currentUser.favorites array on page
 * Will be able to click on a story and add or remove it from favorites
 * Will incorporate a star icon from Font Awesome to show that it is or is not a "favorite" story

*/

// This function displays the "favorites" ol, or just a placeholder text if the user has no favorite stories yet.
function showsFavStories() {
  console.debug("showsFavStories");

  $favStories.empty();

  if (currentUser.favorites.length === 0) {
    $favStories.append("<h5>No favorites added!</h5>");
  } else {
    // loop through all of currentUser.favorites and generate HTML for each favorite story
    for (let favStory of currentUser.favorites) {
      const $story = generateStoryMarkup(favStory);
      $favStories.append($story);
    }
  }
  $favStories.show();
}

//First you'll need to make a star next to the stories. The stars won't be present unless a currentUser is logged in

function getStarHTML(story, user) {
  const isFavorite = user.isFavorite(story);
  const starType = isFavorite ? "fas" : "far";
  return `
      <span class="star">
        <i class="${starType} fa-star"></i>
      </span>`;
}

//click on a story and add or remove it to favorites

async function toggleStoryFavorite(evt) {
  console.debug("toggleStoryFavorite");

  const $tgt = $(evt.target);
  const $closestLi = $tgt.closest("li");
  const storyId = $closestLi.attr("id");
  const story = storyList.stories.find((s) => s.storyId === storyId);

  // see if the item is already favorited (checking by presence of star)
  if ($tgt.hasClass("fas")) {
    // currently a favorite: remove from user's fav list and change star
    await currentUser.removeFavorite(story);
    $tgt.closest("i").toggleClass("fas far");
  } else {
    // currently not a favorite: do the opposite
    await currentUser.addFavorite(story);
    $tgt.closest("i").toggleClass("fas far");
  }
}

$storiesLists.on("click", ".star", toggleStoryFavorite);

// -------------End of Favorites Function Zone-----------------

//
function makeListOfOwnStories() {
  console.debug("makeListOfOwnStories");

  //empty your list at the start so it doesn't replicate over and over again when updating
  $myStoriesList.empty();

  //put some placeholder content on my Own Stories page if currentUser.ownStories
  if (!currentUser.ownStories.length) {
    $myStoriesList.append(
      `<h5>No stories added by ${currentUser.username} yet!</h5>`
    );
  } else {
    //loop through currentUser.ownStories and make html to put in your myStoriesList
    for (let story of currentUser.ownStories) {
      let $story = generateStoryMarkup(story, true);
      $myStoriesList.append($story);
    }
  }
}

//Make a function that creates the html for a trash can icon for "my story" deletion
function getDeleteButton() {
  return `<span><i class="fa-regular fa-trash-can"></i></span>`;
}

//The function below allows you to click on the trash icon to delete a story from ownStories and myStoriesList

async function trashMyStory(evt) {
  console.debug("trashMyStory");
  // console.log("you clicked DELETE");
  const $tgt = $(evt.target);
  const $closestLi = $tgt.closest("li");
  const storyId = $closestLi.attr("id");
  const token = currentUser.loginToken;
  currentUser.ownStories = currentUser.ownStories.filter(
    (s) => s.storyId !== storyId
  );
  await axios({
    url: `${BASE_URL}/stories/${storyId}`,
    method: "DELETE",
    data: { token },
  });

  await makeListOfOwnStories();
  $myStoriesList.show();
}

$myStoriesList.on("click", ".fa-trash-can", trashMyStory);
