<script lang="ts">
    export let state='';

   interface Color {
        primaryColor: string;
        secondaryColor: string;
        tertiaryColor: string;
    }

    const greenColors = 
    {
        primaryColor: '#7BAA80',
        secondaryColor : '#93C29A',
        tertiaryColor : '#639667'
    };

    const grayColors = 
    {
        primaryColor: '#777A77',
        secondaryColor : '#B9B9B9',
        tertiaryColor : '#5A5F5A'
    };


    const redColors = 
    {
        primaryColor: '#F96947',
        secondaryColor : '#FA7C5F',
        tertiaryColor : '#E8563A'
    };
    

  function getColorForState(): Color {
  if (state === 'running') {
    return greenColors;
  } else if (state === 'created') {
    return redColors;
  }
  return grayColors;
    }

</script>

<svg class="w-10 rounded-full" width="53" height="32" viewBox="0 0 53 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#filter0_d_168_1172)">
    <rect x="4" width="45" height="24" rx="2" fill="{getColorForState().primaryColor}"/>
    </g>
    <rect x="16" width="33" height="24" rx="2" fill="{getColorForState().secondaryColor}"/>
    <path d="M4 19H49V22C49 23.1046 48.1046 24 47 24H6C4.89543 24 4 23.1046 4 22V19Z" fill="{getColorForState().tertiaryColor}"/>
    <path d="M16 19H49V22C49 23.1046 48.1046 24 47 24H18C16.8954 24 16 23.1046 16 22V19Z" fill="{getColorForState().primaryColor}"/>
    <path d="M16 19H49V22C49 23.1046 48.1046 24 47 24H18C16.8954 24 16 23.1046 16 22V19Z" fill="{getColorForState().primaryColor}"/>
    <path d="M16 19H49V22C49 23.1046 48.1046 24 47 24H18C16.8954 24 16 23.1046 16 22V19Z" fill="{getColorForState().primaryColor}"/>
    <path d="M16 19H49V22C49 23.1046 48.1046 24 47 24H18C16.8954 24 16 23.1046 16 22V19Z" fill="{getColorForState().primaryColor}"/>
    <path d="M16 19H49V22C49 23.1046 48.1046 24 47 24H18C16.8954 24 16 23.1046 16 22V19Z" fill="{getColorForState().primaryColor}"/>
    <rect x="8" y="3" width="4" height="14" rx="2" fill="white" fill-opacity="0.4"/>
    <rect x="14" y="3" width="4" height="14" rx="2" fill="white" fill-opacity="0.4"/>
    <rect x="21" y="3" width="4" height="14" rx="2" fill="white" fill-opacity="0.4"/>
    <rect x="28" y="3" width="4" height="14" rx="2" fill="white" fill-opacity="0.4"/>
    <rect x="35" y="3" width="4" height="14" rx="2" fill="white" fill-opacity="0.4"/>
    <rect x="42" y="3" width="4" height="14" rx="2" fill="white" fill-opacity="0.4"/>
    <defs>
    <filter id="filter0_d_168_1172" x="0" y="0" width="53" height="32" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
    <feFlood flood-opacity="0" result="BackgroundImageFix"/>
    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
    <feOffset dy="4"/>
    <feGaussianBlur stdDeviation="2"/>
    <feComposite in2="hardAlpha" operator="out"/>
    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_168_1172"/>
    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_168_1172" result="shape"/>
    </filter>
    </defs>
    </svg>
    
