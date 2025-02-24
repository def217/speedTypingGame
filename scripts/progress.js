export function updateProgressBar(progress, progressBar) {
    if (progress < 0) progress = 0;
    if (progress > 100) progress = 100;

    progressBar.setAttribute("aria-valuenow", progress);
    progressBar.style.width = progress + "%";
    progressBar.style.background = `linear-gradient(to right, red, orange ${progress / 2}%, yellow ${progress}%, green)`;
}