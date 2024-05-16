<style>
.pure-material-progress-linear::-webkit-progress-bar {
  background-color: transparent;
}

/* Determinate */
.pure-material-progress-linear::-webkit-progress-value {
  background-color: currentColor;
  transition: all 0.2s;
}

.pure-material-progress-linear::-ms-fill {
  border: none;
  background-color: currentColor;
  transition: all 0.2s;
}

/* Indeterminate */
.pure-material-progress-linear:indeterminate {
  background-size: 200% 100%;
  background-image: linear-gradient(
    to right,
    transparent 50%,
    currentColor 50%,
    currentColor 60%,
    transparent 60%,
    transparent 71.5%,
    currentColor 71.5%,
    currentColor 84%,
    transparent 84%
  );
  animation: pure-material-progress-linear 2s infinite linear;
}

.pure-material-progress-linear:indeterminate::-ms-fill {
  animation-name: none;
}

@keyframes pure-material-progress-linear {
  0% {
    background-size: 200% 100%;
    background-position: left -31.25% top 0%;
  }
  50% {
    background-size: 800% 100%;
    background-position: left -49% top 0%;
  }
  100% {
    background-size: 400% 100%;
    background-position: left -102% top 0%;
  }
}
</style>

<progress class="w-full appearance-none border-none h-0.5 text-purple-500 text-base pure-material-progress-linear"
></progress>
