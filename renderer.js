// Renderer process code
console.log('Renderer process started');
const dateElement = document.getElementById("date");

const today = new Date();

const options = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric"
};

dateElement.textContent = today.toLocaleDateString(undefined, options);