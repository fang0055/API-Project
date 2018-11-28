let myCode = (function () {
    /* globals APIKEY */

    const movieDataBaseURL = "https://api.themoviedb.org/3/";
    let imageURL = null;
    let imageSizes = [];
    let imageURLKey = "imageURLKey";
    let imageSizesKey = "imageSizesKey";
    let timeKey = "timeKey";
    let staleDataTimeOut = 3600;
    let videoTypeKey = "videoTypekey";
    let videoType = null;
    let searchString = "";
    let cards = [];
    let i = null;

    document.addEventListener("DOMContentLoaded", init);

    function init() {
        addEventListeners();
        getDataFromLocalStorage();
    }

    function addEventListeners() {
        document.querySelector(".searchButtonDiv").addEventListener("click", startSearch);
        document.querySelector("#modalButton").addEventListener("click", showOverlay);
        document.querySelector(".cancelButton").addEventListener("click", hideOverlay);
        document.querySelector(".overlay").addEventListener("click", hideOverlay);
        document.querySelector(".saveButton").addEventListener("click", savetype);
        document.querySelector("#backIcon").addEventListener("click", backOnePage);
        document.addEventListener("keypress", function (e) {
            if (e.keyCode === 13) {
                startSearch();
            }
        });
    }

    function backOnePage() {
        if (document.querySelector("#recommend-results").classList[1] !== "hide") {
            document.querySelector("#recommend-results").classList.add("hide");
            document.querySelector("#search-results").classList.remove("hide");
            document.querySelector("#recommend-results").classList.remove("searchPageOn");
        } else {
            document.querySelector("#searchbar").classList.remove("fixedPosition");
            document.querySelector("#movieBig").classList.remove("hiddeMovie");
            document.querySelector("#search-results").classList.remove("searchPageOn");
            document.querySelector("#search-results").classList.add("hide");
            document.querySelector("#backIcon").classList.add("hide");
            document.querySelector("#imageAttri").classList.remove("imageAttriRe");
        }
    }

    function savetype(e) {
        let typeList = document.getElementsByName("video");
        for (let i = 0; i < typeList.length; i++) {
            if (typeList[i].checked) {
                videoType = typeList[i].value;
                document.querySelector("#movieBig").textContent = `${typeList[i].id}`
                break;
            }
        }
        localStorage.setItem(videoTypeKey, JSON.stringify(videoType));
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
        console.log("start checking");

        if (JSON.parse(localStorage.getItem(videoTypeKey)) == "tv") {
            document.querySelector("#movieBig").textContent = "TV";
        } else {
            document.querySelector("#movieBig").textContent = "MOVIE";
        }
        // 30 seconds, good for testing
        // First see if the key exists in local storage
        if (!localStorage.getItem(imageURLKey) || !localStorage.getItem(imageSizesKey) || !localStorage.getItem(timeKey)) {
            console.log("lose at least one local storage");
            getPosterURLAndSizes();
        } else if (localStorage.getItem(imageURLKey) && localStorage.getItem(imageSizesKey) && localStorage.getItem(timeKey)) {
            console.log("local storage already exists");

            let savedDate = localStorage.getItem(timeKey); // get the saved date sting
            savedDate = new Date(savedDate); // use this string to initialize a new Date object
            let seconds = calculateElapsedTime(savedDate);
            if (seconds > staleDataTimeOut) {
                console.log("Local Storage Data is expired");
                getPosterURLAndSizes();
            }
        } else {
            console.log("Exist and within 60 minutes");
        }



        // check if image secure base URL and sizes array are stored in local storage, if not call getPosterURLAndSizes()

        // if in local storage check if saved over 60 mins ago, if ture(60+) then call getPosterURLAndSizes()

        // in local storage AND less 60 mins old, load and use from local storage

    }

    function calculateElapsedTime(savedDate) {
        let now = new Date(); // get the current time
        // calculate elapsed time
        let elapsedTime = now.getTime() - savedDate.getTime(); // this in milliseconds
        let seconds = Math.ceil(elapsedTime / 1000);
        console.log("Elapsed Time: " + seconds + " seconds");
        return seconds;
    }

    function saveDateToLocalStorage() {
        console.log("Saving current Date to Local Storage");
        let now = new Date();
        localStorage.setItem(timeKey, now);
    }

    function getPosterURLAndSizes() {
        let url = `${movieDataBaseURL}configuration?api_key=${APIKEY}`;
        fetch(url)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                saveDateToLocalStorage();
                console.log(data);
                imageURL = data.images.secure_base_url;
                imageSizes = data.images.poster_sizes;
                localStorage.setItem(imageURLKey, JSON.stringify(imageURL));
                localStorage.setItem(imageSizesKey, JSON.stringify(imageSizes));
                console.log(JSON.parse(localStorage.getItem(imageURLKey)));
                console.log(JSON.parse(localStorage.getItem(imageSizesKey)));
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
        document.querySelector("#backIcon").classList.remove("hide");
        getSearchResults();
    }

    function getSearchResults() {
        document.querySelector("#searchbar").classList.add("fixedPosition");
        document.querySelector("#movieBig").classList.add("hiddeMovie");
        document.querySelector("#recommend-results").classList.add("hide");
        document.querySelector("#imageAttri").classList.add("imageAttriRe");
        if (!JSON.parse(localStorage.getItem(videoTypeKey))) {
            videoType = "movie";
            localStorage.setItem(videoTypeKey, JSON.stringify(videoType));
        } else {
            videoType = JSON.parse(localStorage.getItem(videoTypeKey));
        }
        console.log(videoType);
        let url = `${movieDataBaseURL}search/${videoType}?api_key=${APIKEY}&query=${searchString}`;
        let content = document.querySelector("#search-results>.content");

        fetch(url)
            .then((response) => response.json())
            .then(function (data) {
                console.log(data);
                content.innerHTML = "";
                document.querySelector("#search-results").classList.remove("hide");
                document.querySelector("#search-results").classList.add("searchPageOn");
                for (i = 0; i < data.results.length; i++) {
                    cards.push(createMovieCard(data));
                }

                let documentFragment = new DocumentFragment();

                cards.forEach(function (item) {
                    documentFragment.appendChild(item);
                });
                content.appendChild(documentFragment);

                let cardList = document.querySelectorAll(".content>div");

                cardList.forEach(function (item) {
                    item.addEventListener("click", getRecommendationResult);
                });
            })
            .catch((error) => alert(error));
    }

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
        let movieID = document.createElement("p");

        if (JSON.parse(localStorage.getItem(videoTypeKey)) == "movie") {
            document.querySelector(".titleMovie").textContent = "Results: Movie";
            movieTitle.textContent = data.results[i].title;
            movieDate.textContent = data.results[i].release_date;
            movieCard.setAttribute("data-title", data.results[i].title);
        } else {
            document.querySelector(".titleMovie").textContent = "Results: TV";
            movieTitle.textContent = data.results[i].name;
            movieDate.textContent = data.results[i].first_air_date;
            movieCard.setAttribute("data-title", data.results[i].name);
        }

        movieRating.textContent = data.results[i].vote_average;
        movieOverview.textContent = data.results[i].overview;
        movieID.textContent = data.results[i].id;

        imageURL = JSON.parse(localStorage.getItem(imageURLKey));
        imageSizes = JSON.parse(localStorage.getItem(imageSizesKey));
        //    console.log("card card card card card card card card card");
        console.log(imageURL);
        console.log(imageSizes[2]);
        image.src = `${imageURL}${imageSizes[2]}${data.results[i].poster_path}`;
        image.setAttribute("alt", "poster's not available");

        movieCard.setAttribute("data-id", data.results[i].id);

        movieCard.className = "movieCard";
        section.className = "imageSection";
        movieTitle.className = "movieHeader";
        //    movieID.className = "movieID";

        console.log(movieCard);
        section.appendChild(image);
        movieCard.appendChild(section);
        movieCard.appendChild(movieTitle);
        movieCard.appendChild(movieDate);
        movieCard.appendChild(movieRating);
        movieCard.appendChild(movieOverview);
        //    movieCard.appendChild(movieID);

        documentFragment.appendChild(movieCard);
        //    document.querySelector("#search-results").classList.remove("searchPageOn");
        //    document.querySelector("#search-results").classList.add("searchPageOn");
        return documentFragment;

    }

    function getRecommendationResult() {
        console.log("start to recommend!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")

        let dataID = this.getAttribute("data-id");
        console.log(dataID);
        let inputtext = this.getAttribute("data-title");
        document.querySelector("#search-input").value = inputtext;

        let url = `${movieDataBaseURL}${videoType}/${this.getAttribute("data-id")}/recommendations?api_key=${APIKEY}&language=en-US&page=1`

        if (videoType == "movie") {
            document.querySelector(".titleReco").textContent = "Recommendation: Movie";
        } else {
            document.querySelector(".titleReco").textContent = "Recommendation: TV";
        }
        let content = document.querySelector("#recommend-results>.content");
        fetch(url)
            .then((response) => response.json())
            .then(function (data) {
                console.log(data);
                content.innerHTML = "";
                for (i = 0; i < data.results.length; i++) {
                    //                title = data.results[i].title;
                    //                console.log(title);
                    cards.push(createMovieCard(data));
                }

                let documentFragment = new DocumentFragment();

                cards.forEach(function (item) {
                    documentFragment.appendChild(item);
                });

                content.appendChild(documentFragment);

                let cardList = document.querySelectorAll(".content>div");

                cardList.forEach(function (item) {
                    item.addEventListener("click", getRecommendationResult);
                });
                document.querySelector("#search-results").classList.add("hide");
                document.querySelector("#recommend-results").classList.remove("hide");
                document.querySelector("#recommend-results").classList.add("searchPageOn");
            })
            .catch((error) => alert(error));
    }
})();
