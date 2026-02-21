const noBtn = document.getElementById("noBtn");
const yesBtn = document.getElementById("yesBtn");
const result = document.getElementById("result");
const buttons = document.querySelector(".buttons");

noBtn.addEventListener("mouseover", () => {

  const areaWidth = buttons.clientWidth;
  const areaHeight = buttons.clientHeight;

  const btnWidth = noBtn.offsetWidth;
  const btnHeight = noBtn.offsetHeight;

  const maxX = areaWidth - btnWidth;
  const maxY = areaHeight - btnHeight;

  const randomX = Math.random() * maxX;
  const randomY = Math.random() * maxY;

  noBtn.style.left = randomX + "px";
  noBtn.style.top = randomY + "px";
  noBtn.style.right = "auto"; // penting supaya tidak konflik
});

yesBtn.addEventListener("click", () => {
  buttons.style.display = "none";
  result.classList.remove("hidden");
});