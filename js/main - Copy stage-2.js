/* globals APIKEY */

const movieDataBaseURL = "https://api.themoviedb.org/3/";
let imageURL = null;
let imageSizes = [];

let searchString = "";
let movie = {};
//let title = null;
let cards = [];
let content = document.querySelector("#search-results>.content");
let videoTypekey = null;
let videoType = "movie";
let i = 0;

document.addEventListener("DOMContentLoaded", init);

function init() {
    //console.log(APIKEY);
    addEventListeners();
    getDataFromLocalStorage();
}

function addEventListeners() {
    let searchButton = document.querySelector(".searchButtonDiv");
    searchButton.addEventListener("click", startSearch);
    document.querySelector("#modalButton").addEventListener("click", showOverlay);
    document.querySelector(".cancelButton").addEventListener("click", hideOverlay);
    document.querySelector(".overlay").addEventListener("click", hideOverlay);
    document.querySelector(".saveButton").addEventListener("click", savetype);
}

function savetype(e) {
    let typeList = document.getElementsByName("video");
    for (let i = 0; i < typeList.length; i++) {
        if (typeList[i].checked) {
            videoType = typeList[i].value;
            break;
        }
    }
    localStorage.setItem(videoTypekey, JSON.stringify(videoType));
    console.log(videoType);
    hideOverlay(e);
}

function showOverlay(e) {
    e.preventDefault();
    let overlay = document.querySelector(".overlay");
    overlay.classList.remove("hide");
    overlay.classList.add("show");
    showModal(e);

}

function showModal(e) {
    e.preventDefault();
    let modal = document.querySelector(".modal");
    modal.classList.remove("off");
    modal.classList.add("on");
}

function hideOverlay(e) {
    e.preventDefault();
    e.stopPropagation(); // don't allow clicks to pass through
    let overlay = document.querySelector(".overlay");
    overlay.classList.remove("show");
    overlay.classList.add("hide");
    hideModal(e);
}

function hideModal(e) {
    e.preventDefault();
    let modal = document.querySelector(".modal");
    modal.classList.remove("on");
    modal.classList.add("off");
}

function getDataFromLocalStorage() {
    // check if image secure base URL and sizes array are stored in local storage, if not call getPosterURLAndSizes()

    // if in local storage check if saved over 60 mins ago, if ture(60+) then call getPosterURLAndSizes()

    // in local storage AND less 60 mins old, load and use from local storage
    getPosterURLAndSizes();
}

function getPosterURLAndSizes() {
    let url = `${movieDataBaseURL}configuration?api_key=${APIKEY}`;

    fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data);
            imageURL = data.images.secure_base_url;
            imageSizes = data.images.poster_sizes;

            console.log(imageURL);
            console.log(imageSizes);
        })
        .catch(function (error) {
            console.log(error);
        })
}

function startSearch() {
    console.log("start search");
    searchString = document.getElementById("search-input").value;
    if (!searchString) {
        alert("Please enter search data");
        document.getElementById("search-input").focus();
        return;
    }
    // this is a new search so you should reset any existing page data
    content.innerHTML = "";
    getSearchResults();

}

function getSearchResults() {
    videoType = JSON.parse(localStorage.getItem(videoTypekey));
    console.log(videoType);
    let url = `${movieDataBaseURL}search/${videoType}?api_key=${APIKEY}&query=${searchString}`;

    fetch(url)
        .then((response) => response.json())
        .then(function (data) {
            console.log(data);
            for (let i = 0; i < data.results.length; i++) {
                //                title = data.results[i].title;
                //                console.log(title);
                cards.push(createMovieCard(data));
            }

            let documentFragment = new DocumentFragment();

            cards.forEach(function (item) {
                documentFragment.appendChild(item);
            });

            content.appendChild(documentFragment);

        })
        .catch((error) => alert(error));

    function createMovieCard(data) {
        console.log(data);
        let documentFragment = new DocumentFragment();

        let movieCard = document.createElement("div");
        let section = document.createElement("section");
        let image = document.createElement("img");
        let movieTitle = document.createElement("p");
        let movieDate = document.createElement("p");
        let movieRating = document.createElement("p");
        let movieOverview = document.createElement("p");

        movieTitle.textContent = data.results[i].title;
        movieDate.textContent = data.results[i].release_date;
        movieRating.textContent = data.results[i].vote_average;
        movieOverview.textContent = data.results[i].overview;

        image.src = `https://image.tmdb.org/t/p/w185${data.results[i].poster_path}`;

        movieCard.setAttribute("data-title", data.results[i].title);

        movieCard.classname = "movieCard";
        section.classname = "imageSection";

        section.appendChild(image);
        movieCard.appendChild(section);
        movieCard.appendChild(movieTitle);
        movieCard.appendChild(movieDate);
        movieCard.appendChild(movieRating);
        movieCard.appendChild(movieOverview);

        documentFragment.appendChild(movieCard);

        return documentFragment;
    }


    //    let content = document.querySelector("#search-results>.content");
    //
    //    let cards = []; // an array of document fragments
    //
    //    // create some sample cards
    //    for (let i = 0; i < 5; i++) {
    //        cards.push(createMovieCard(movie));
    //    }
    //
    //    console.log(cards);
    //
    //    // A DocumentFragment is a minimal document object that has no parent.
    //    // It's used as a light weight version of document to store newly created HTML elements
    //
    //    // using DocumentFragment's to append is far, far faster than appending directly to the document
    //    // using DocumentFragment's also reduces recalculation, painting and layout to an absolute minimum,
    //    // because these events only happen once, instead of happening once for every single element added.
    //
    //    let documentFragment = new DocumentFragment();
    //
    //    cards.forEach(function (item) {
    //        documentFragment.appendChild(item);
    //    });
    //
    //    content.appendChild(documentFragment);
    //
    //    let cardList = document.querySelectorAll(".content>div");
    //
    //    cardList.forEach(function (item) {
    //        item.addEventListener("click", getRecommendations);
    //    });
    //
    //    function createMovieCard(movie) {
    //        let documentFragment = new DocumentFragment(); // use a documentFragment for performance
    //
    //        let movieCard = document.createElement("div");
    //        let section = document.createElement("section");
    //        let image = document.createElement("img");
    //        let videoTitle = document.createElement("p");
    //        let videoDate = document.createElement("p");
    //        let videoRating = document.createElement("p");
    //        let videoOverview = document.createElement("p");
    //
    //        // set up the content
    //        videoTitle.textContent = movie.title;
    //        videoDate.textContent = movie.release_date;
    //        videoRating.textContent = movie.vote_average;
    //        videoOverview.textContent = movie.overview;
    //
    //        // set up image source URL
    //        image.src = `https://image.tmdb.org/t/p/w185${movie.poster_path}`;
    //
    //        // set up movie data attributes
    //        movieCard.setAttribute("data-title", movie.title);
    //
    //        // set up class names
    //        movieCard.className = "movieCard";
    //        section.className = "imageSection";
    //
    //        // append elements
    //        section.appendChild(image);
    //        movieCard.appendChild(section);
    //        movieCard.appendChild(videoTitle);
    //        movieCard.appendChild(videoDate);
    //        movieCard.appendChild(videoRating);
    //        movieCard.appendChild(videoOverview);
    //
    //        documentFragment.appendChild(movieCard);
    //
    //        return documentFragment;
}
//}
