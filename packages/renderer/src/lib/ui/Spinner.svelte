<script lang="ts">
export let size = '2em';
</script>

<i class="flex justify-center items-center">
  <svg width="{size}" height="{size}" viewBox="0 0 100 100" role="img">
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:rgb(0,0,0);stop-opacity:1"></stop>
        <stop offset="60%" style="stop-color:rgb(0,0,0);stop-opacity:1"></stop>
        <stop offset="100%" style="stop-color:rgb(255,255,255);stop-opacity:1"></stop>
      </linearGradient>
    </defs>
    <mask id="myMask">
      <rect x="0" y="0" width="100" height="100" fill="white"></rect>
      <rect x="-25" y="-25" width="150" height="75" fill="black"></rect>
      <g transform="translate(50,50)" style="width={size}; height={size}">
        <g>
          <rect x="-75" y="-75" width="150" height="75" fill="url(#grad1)"></rect>
          <rect x="-75" y="-70" width="100" height="75" fill="black"></rect>
          <animateTransform
            attributeName="transform"
            type="rotate"
            dur="1.5s"
            from="0"
            to="180"
            values="0; 140;180; 140; 0"
            keyTimes="0; 0.25;0.5; 0.75;1"
            repeatCount="indefinite"></animateTransform>
        </g>
      </g>
    </mask>
    <circle
      cx="50"
      cy="50"
      r="46"
      stroke="currentColor"
      opacity="0.8"
      stroke-width="10"
      fill="transparent"
      mask="url(#myMask)"></circle>
    <animateTransform
      attributeName="transform"
      type="rotate"
      dur="3s"
      from="0"
      to="360"
      repeatCount="indefinite"
      values="0;90;180;270;360;450;540;630;720;810;900;990;1080;1170;1260;1350;1440;1530;1620;1710;1800"
      keyTimes="0; 0.02;0.08;0.18;0.32;0.375;0.42;0.455;0.48;0.495;0.5;0.52;0.58;0.68;0.82;0.875;0.92;0.955;0.98;0.995;1"
    ></animateTransform>
  </svg>
</i>
