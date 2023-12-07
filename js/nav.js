"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

async function navAllStories(evt) {
  console.debug("navAllStories", evt);
  storyList = await StoryList.getStories();
  hidePageComponents();
  $submitForm.hide();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show story submit form on clicking story "submit" */

function navSubmitStoryClick(evt) {
  console.debug("navSubmitStoryClick", evt);
  console.log("You clicked nav submit");
  hidePageComponents();
  // $allStoriesList.show();
  $submitForm.show();
  putStoriesOnPage();
}

$navSubmitStory.on("click", navSubmitStoryClick);

// Show favorites list when navBar "favorites" link is clicked
function clickNavFavorites(evt) {
  console.debug("navFavoritesClick", evt);
  hidePageComponents();
  $submitForm.hide();

  showsFavStories();
}

$navToFavs.on("click", clickNavFavorites);
/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $loginForm.hide();
  $signupForm.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

//Navigate to my stories list

function navToMyStories(evt) {
  console.debug("navToMyStories", evt);
  console.log("You clicked MY STORIES");
  hidePageComponents();
  $submitForm.hide();
  makeListOfOwnStories();
  $myStoriesList.show();
}

$navToMyStoriesButton.on("click", navToMyStories);
