const sections = document.querySelectorAll("section");

window.onscroll = function () {
  scrollFunction();
};

function scrollFunction() {
  const scrollLimit = 300;
  const arrowTop = document.getElementById("arrowTop");
  const arrowDown = document.getElementById("arrowDown");
  if (
    document.body.scrollTop > scrollLimit ||
    document.documentElement.scrollTop > scrollLimit
  ) {
    arrowTop.classList.add("show");
    arrowDown.classList.remove("show");
  } else {
    arrowTop.classList.remove("show");
    arrowDown.classList.add("show");
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function scrollDown() {
  document.getElementById("about").scrollIntoView();
}
