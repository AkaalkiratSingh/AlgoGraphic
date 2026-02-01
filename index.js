window.addEventListener("beforeunload", function (e) {
    e.preventDefault();
    //e.returnValue = ""; // required for Chrome
});
