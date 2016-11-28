/**
 * Treehouse Full Stack Javascript Tech Degree
 *  Project #5: Movie Search + EXTRA CREDIT
 *  Author: lis22
 *  Date: Nov 28, 2016
 */

(function() {
    "use strict";

    document.getElementById("search").focus();

    /**
     * ajaxRequest()
     * @param url - accepts where the request is going
     * Creates an XMLHTTP request object, create a callback function,
     * opens a request and sends the request to IMDB, and wraps it in a Promise
     * Uses Promises because I wanted to create a singular ajax function to be used twice
     * Returns a promise that is either resolved or rejected
     */
    function ajaxRequest(url) {

        return new Promise(function(resolve, reject) {

            var xhr = new XMLHttpRequest();

            xhr.onreadystatechange = function () {
                const DONE = 4;
                const OK = 200;

                if (xhr.readyState === DONE) {

                    if (xhr.status === OK) {
                        resolve(JSON.parse(xhr.responseText));
                    }
                    else {
                        reject(Error(xhr.statusText));
                    }
                }
            };
            xhr.open("GET", url);

            xhr.send();
        });
    }

    /** When submit button is clicked, extracts search term, shows loading screen,
     *  and uses AJAX to send it to IMDB and gets results
     */
    document.getElementById("submit").addEventListener("click", function(event) {
        var movieList, searchBox, yearBox, searchTerm, yearVal, url;

        event.preventDefault();

        movieList = document.getElementById("movies");
        searchBox = document.getElementById("search");
        yearBox = document.getElementById("year");

        if(movieList.hasChildNodes())
            removeList(movieList);

        if (searchBox.value) {
            searchTerm = searchBox.value;
            //EXTRA CREDIT: optional year value
            yearVal = yearBox.value;

            searchBox.value = "";
            yearBox.value = "";

            showLoadingScreen();

            url = "https://www.omdbapi.com/?s=" + searchTerm + "&y=" + yearVal + "&r=json";

            /**
             * Calls to do ajax request
             *
             * .then called when Promise gets back
             * .then accepts two functions: 1st when promise resolved, and 2nd when promise rejected
             *
             * @param data: data retrieved from IMDB
             * @param data.Response: indicates whether IMDB was able to retrieve the movie
             * @param data.Search: an array of movie data
             * @param error: status error
             */
            ajaxRequest(url).then(function(data) {
                showMainPage();

                if(data.Response === "True")
                    getMovieList(data.Search);
                else
                    getNoResults(searchTerm);
            }, function(error) {
                console.log(error);
            });
        }

    });

    /**
     * getMovieList()
     * @param data: Array of movie data
     * @param data.length: size of data array
     * @param data.imdbID: movie id
     * @param data.Poster: url of poster
     * @param data.Title: title of movie
     * @param data.Year: year of movie
     * Creates a fragment and page elements needed to show the movies
     * matching the search term and appends fragment to page
     */
    function getMovieList(data) {

        var frag, li, div, img, icon,titleSpan,yearSpan;

        frag = document.createDocumentFragment();

        for (var i = 0; i < data.length; i++) {
            li = document.createElement("li");
            li.id = data[i].imdbID;
            frag.appendChild(li);

            div = document.createElement("div");
            div.classList.add("poster-wrap");
            li.appendChild(div);

            if (data[i].Poster !== "N/A") {
                img = document.createElement("img");
                img.classList.add("movie-poster");
                img.src = data[i].Poster;
                div.appendChild(img);
            }
            else {
                icon = document.createElement("i");
                icon.classList.add("material-icons", "poster-placeholder");
                icon.textContent = "crop_original";
                div.appendChild(icon);
            }

            titleSpan = document.createElement("span");
            titleSpan.classList.add("movie-title");
            titleSpan.textContent = data[i].Title;
            li.appendChild(titleSpan);

            yearSpan = document.createElement("span");
            yearSpan.classList.add("movie-year");
            yearSpan.textContent = data[i].Year;
            li.appendChild(yearSpan);
        }

        document.getElementById("movies").appendChild(frag);
    }

    /**
     * getNoResults()
     * @param searchTerm: what the user entered to search for
     * Creates fragment and page elements needed to show when
     * a search term wasn't found and appends fragment to page
     */
    function getNoResults(searchTerm) {
        var frag, li, icon, text;

        frag = document.createDocumentFragment();
        li = document.createElement("li");

        li.classList.add("no-movies");
        frag.appendChild(li);

        icon = document.createElement("i");
        icon.classList.add("material-icons","icon-help");
        icon.textContent = "help_outline";
        li.appendChild(icon);

        text = document.createTextNode("No movies found that match: " + searchTerm);
        li.appendChild(text);

        document.getElementById("movies").appendChild(frag);
    }

    /**
     * Individual movie event handler
     * When a movie or movie name is clicked retrieves the movie id,
     * shows the loading screen, then calls to do an ajax request
     */
    document.getElementById("movies").addEventListener("click",function(event) {
        var id, url;

        if(event.target.nodeName === "IMG" || event.target.nodeName === "I")
            id = event.target.parentElement.parentElement.id;

        else if(event.target.nodeName === "SPAN" || event.target.nodeName === "DIV")
            id = event.target.parentElement.id;

        showLoadingScreen();

        url = "https://www.omdbapi.com/?i=" + id + "&y=" + "&plot=full" + "&r=json";

        /**
         * Calls to do ajax request
         * .then called when Promise gets back
         * .then accepts two functions: 1st when promise resolved, and 2nd when promise rejected
         * @param data: imdb data return
         * @param error: status error
         */
        ajaxRequest(url).then(function(data) {
            showOverlay();
            getMovieDescription(data,id);

        }, function(error) {
            console.log(error);

        });

    });

    /**
     * getMovieDescription()
     * @param data - the data received from ajax call
     * @param data.Poster: poster url
     * @param data.Year: year of movie
     * @param data.imdbRating: rating of movie
     * @param data.Plot: full plot of movie
     * @param data.Title: title of movie
     * @param id - the movie id value
     * EXTRA CREDIT: Creates and shows the description page displaying a movie's title,
     * year, poster, plot information, IMDb rating, and IMDB link in a new window/tab.
     * Hides the movie list.
     */
    function getMovieDescription(data,id) {
        if(data.Poster !=="N/A") {
            document.getElementById("picture").style.backgroundImage = "url(" + data.Poster + ")";
            document.getElementById("picture").style.backgroundSize = "cover";
        }
        else {
            document.getElementById("picture").style.backgroundImage = "url(img/noImage.svg)";
            document.getElementById("picture").style.backgroundSize = "60%";
        }

        document.getElementById("title").textContent = data.Title +" (" + data.Year +")";
        document.getElementById("rating").textContent = "imdb rating: " + data.imdbRating;
        document.getElementById("plot").textContent = data.Plot;
        document.getElementById("imdbBtn").href = "http://www.imdb.com/title/" +id;
        document.getElementById("imdbBtn").target ="_blank";
    }

    /**
     * Back button event handler used in the movie description overlay
     * Calls showMainPage() to take screen back to movie list
     */
    document.getElementById("backBtn").addEventListener("click",function() {
        showMainPage();
    });

    /**
     * showOverlay()
     * Enables the movie Description overlay and disables the movie list main content
     */
    function showOverlay() {
        document.getElementById("search").focus();
        document.getElementsByClassName("main-content")[0].style.display = "none";
        document.getElementsByClassName("main-content")[0].classList.remove("loading");
        document.getElementById("overlay").style.display = "block";
    }

    /**
     * showMainPage()
     * Removes overlay and shows movie list
     */
    function showMainPage() {
        document.getElementById("overlay").style.display = "none";
        document.getElementById("movies").style.display = "block";
        document.getElementsByClassName("main-content")[0].classList.remove("loading");
        document.getElementsByClassName("main-content")[0].style.display = "block";
    }

    /**
     * showLoadingScreen()
     * Removes the movies list and displays a spinner while
     * waiting for the ajax request to return
     */
    function showLoadingScreen() {
        document.getElementById("movies").style.display = "none";
        document.getElementsByClassName("main-content")[0].classList.add("loading");
    }

    /**
     * removeList()
     * Clears a ul list
     * @param list: list to be cleared
     */
    function removeList(list) {
        list.innerHTML = "";
    }
}());