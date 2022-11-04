<script lang="ts">
export let state = '';
</script>

{#if state === 'RUNNING'}
  <div class="flex justify-center">
    <svg
      id="running"
      width="24"
      height="24"
      version="1.1"
      viewBox="0 0 6.35 6.35"
      xml:space="preserve"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      ><g transform="translate(28.585 -26.647)"
        ><g transform="matrix(.26458 0 0 .26458 -29.906 26.92)" fill="none"
          ><g transform="matrix(.90909 0 0 .90909 1.5451 .99685)" stroke-width="1.1"
            ><path
              d="m8.0765-0.034671h17.838c1.1528 0 2.0809 1.0604 2.0809 2.3776v17.245c0 1.3172-0.92807 2.3776-2.0809 2.3776h-17.838c-1.1528 0-2.0809-1.0604-2.0809-2.3776v-17.245c0-1.3172 0.92807-2.3776 2.0809-2.3776z"
              fill="#64ad6c"
              stroke-linecap="round"
              stroke-linejoin="round"></path
            ><g transform="translate(.64282 -1.0347)" rx="0" ry="0" stroke-width="1.1"
              ><g transform="translate(1.3528)" stroke-width="1.1"
                ><g stroke-width="1.1"
                  ><path
                    rx="0"
                    ry="0"
                    d="m13 6.5c0-0.828 0.672-1.5 1.5-1.5h1c0.828 0 1.5 0.672 1.5 1.5v11c0 0.828-0.672 1.5-1.5 1.5h-1c-0.828 0-1.5-0.672-1.5-1.5zm-5 6c0-0.828 0.672-1.5 1.5-1.5h1c0.828 0 1.5 0.672 1.5 1.5v5c0 0.828-0.672 1.5-1.5 1.5h-1c-0.828 0-1.5-0.672-1.5-1.5zm12.5-5.5c0.828 0 1.5 0.672 1.5 1.5v9c0 0.828-0.672 1.5-1.5 1.5h-1c-0.828 0-1.5-0.672-1.5-1.5v-9c0-0.828 0.672-1.5 1.5-1.5z"
                    fill="#fff"
                    stroke-width="1.1"></path
                  ></g
                ></g
              ></g
            ></g
          ><g
            transform="matrix(.75157 0 0 .75157 63.838 -3.9997)"
            fill="#b6b6b6"
            stroke-width="1.3305"
            style="-webkit-print-color-adjust:exact"
            ><g transform="translate(-3.2856 8.5688)" rx="0" ry="0" fill="#b6b6b6" stroke-width="1.3305"
              ><g rx="0" ry="0" fill="#b6b6b6" stroke-width="1.3305"><g fill="#b6b6b6" stroke-width="1.3305"></g></g></g
            ></g
          ></g
        ></g
      ></svg>
  </div>
{:else if state === 'CREATED'}
  <div class="flex justify-center">
    <svg
      id="created"
      width="24"
      height="24"
      version="1.1"
      viewBox="0 0 6.35 6.35"
      xml:space="preserve"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      ><defs
        ><radialGradient
          id="radialGradient11297"
          cx="71.342"
          cy="50.591"
          r="7.0467"
          gradientTransform="matrix(.3909 .71073 -.84194 .46307 86.049 -23.543)"
          gradientUnits="userSpaceOnUse"
          ><stop stop-color="#fffbce" offset="0"></stop><stop stop-color="#ffe500" offset="1"></stop></radialGradient
        ></defs
      ><g transform="translate(13.762 -26.678)"
        ><g transform="matrix(.26458 0 0 .26458 -29.906 26.92)"
          ><path
            d="m65.72 1.0867c-1.5564 0-2.7051 1.3959-2.7051 2.9434v14.111c0 1.5474 1.1486 2.9434 2.7051 2.9434h14.596c1.5564 0 2.7051-1.3959 2.7051-2.9434v-11.079l-2.0078-0.86432v11.943c0 0.608-0.36731 0.94336-0.69727 0.94336h-14.596c-0.32995 0-0.70508-0.33535-0.70508-0.94336v-14.111c0-0.608 0.37512-0.94336 0.70508-0.94336h11.258l-1.2241-1.381c-0.21865-0.23393 0.53427-0.34836 1.0223-0.61905zm7.2988 3.9844c-0.41562 0-0.75195 0.34699-0.75195 0.77539v5.4316c0 0.42915 0.33633 0.77539 0.75195 0.77539 0.41562 0 0.75-0.34624 0.75-0.77539v-5.4316c0-0.4284-0.33438-0.77539-0.75-0.77539zm-3.1094 1.5508c-0.0301-6.524e-4 -0.0598 8.062e-4 -0.08984 0.00391-0.14418 0.014881-0.28451 0.073192-0.4043 0.17578-1.2408 1.0672-2.0352 2.6764-2.0352 4.4531 0 3.234 2.5264 5.8418 5.6387 5.8418s5.6367-2.6078 5.6367-5.8418c0-1.7767-0.79506-3.3859-2.0352-4.4531-0.31942-0.27357-0.79254-0.22838-1.0586 0.10156-0.26531 0.32919-0.22177 0.81822 0.09766 1.0918 0.91091 0.78314 1.4922 1.9642 1.4922 3.2832 0 2.3569-1.8495 4.2656-4.1328 4.2656-2.2825 0-4.1348-1.9087-4.1348-4.2656 0-1.319 0.58128-2.5001 1.4922-3.2832 0.31942-0.27357 0.34192-0.76261 0.09766-1.0918-0.1455-0.18044-0.35378-0.27668-0.56445-0.28125z"
            color="#000000"
            fill="#b6b6b6"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="3.7795"
            style="-inkscape-stroke:none;-webkit-print-color-adjust:exact"></path
          ><g
            transform="matrix(.75157 0 0 .75157 63.838 -3.9997)"
            fill="#b6b6b6"
            stroke-width="1.3305"
            style="-webkit-print-color-adjust:exact"
            ><g transform="translate(-3.2856 8.5688)" rx="0" ry="0" fill="#b6b6b6" stroke-width="1.3305"
              ><g rx="0" ry="0" fill="#b6b6b6" stroke-width="1.3305"><g fill="#b6b6b6" stroke-width="1.3305"></g></g></g
            ></g
          ><path
            transform="matrix(.53196 -.054438 .054365 .53134 39.865 -20.008)"
            d="m74.843 56.148-3.5805-2.3908-3.9993 1.5941 1.1674-4.1441-2.752-3.311 4.302-0.17036 2.2985-3.6404 1.4914 4.0388 4.1725 1.0611-3.3802 2.6665z"
            fill="url(#radialGradient11297)"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width=".93558"></path
          ></g
        ></g
      ></svg>
  </div>
{:else}
  <div class="flex justify-center">
    <svg
      id="stopped"
      width="24"
      height="24"
      version="1.1"
      viewBox="0 0 5.9976 6.2711"
      xml:space="preserve"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      ><g transform="translate(21.219 -26.632)"
        ><g transform="matrix(.26458 0 0 .26458 -29.906 26.92)" fill="#b6b6b6"
          ><g transform="matrix(.9 0 0 .9 4.4169 1.076)" stroke-width="1.1111"
            ><path
              d="m36.061-0.35051c-1.7294 0-3.0035 1.5532-3.0035 3.2726v15.675c0 1.7194 1.2741 3.2747 3.0035 3.2747h16.215c1.7294 0 3.0035-1.5554 3.0035-3.2747v-15.675c0-1.7194-1.2741-3.2726-3.0035-3.2726zm0 2.2222h16.215c0.36662 0 0.78125 0.3748 0.78125 1.0503v15.675c0 0.67555-0.41463 1.0525-0.78125 1.0525h-16.215c-0.36662 0-0.78125-0.37696-0.78125-1.0525v-15.675c0-0.67555 0.41463-1.0503 0.78125-1.0503zm8.1076 2.207c-0.4618 0-0.8355 0.38555-0.8355 0.86155v6.0352c0 0.47683 0.3737 0.86154 0.8355 0.86154s0.8355-0.38471 0.8355-0.86154v-6.0352c0-0.476-0.3737-0.86155-0.8355-0.86155zm-3.3919 1.7274c-0.21305-0.020146-0.43452 0.043328-0.61198 0.19531-1.3787 1.1858-2.2591 2.976-2.2591 4.9501 0 3.5934 2.8049 6.4887 6.263 6.4887s6.263-2.8954 6.263-6.4887c0-1.9741-0.88123-3.7643-2.2591-4.9501-0.35491-0.30397-0.88277-0.25375-1.1784 0.11285-0.29478 0.36577-0.24423 0.90914 0.11068 1.2131 1.0121 0.87016 1.658 2.1824 1.658 3.648 0 2.6188-2.0572 4.7396-4.5942 4.7396-2.5361 0-4.592-2.1208-4.592-4.7396 0-1.4656 0.6437-2.7778 1.6558-3.648 0.35491-0.30397 0.38208-0.84734 0.11068-1.2131-0.14781-0.1833-0.35336-0.28801-0.56641-0.30816z"
              color="#000000"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="-inkscape-stroke:none;-webkit-print-color-adjust:exact"></path
            ><g
              transform="matrix(.83508 0 0 .83508 33.969 -5.9995)"
              stroke-width="1.3305"
              style="-webkit-print-color-adjust:exact"
              ><g transform="translate(-3.2856 8.5688)" rx="0" ry="0" fill="#b6b6b6" stroke-width="1.3305"
                ><g rx="0" ry="0" fill="#b6b6b6" stroke-width="1.3305"><g fill="#b6b6b6" stroke-width="1.3305"></g></g
                ></g
              ></g
            ></g
          ><g
            transform="matrix(.75157 0 0 .75157 63.838 -3.9997)"
            stroke-width="1.3305"
            style="-webkit-print-color-adjust:exact"
            ><g transform="translate(-3.2856 8.5688)" rx="0" ry="0" fill="#b6b6b6" stroke-width="1.3305"
              ><g rx="0" ry="0" fill="#b6b6b6" stroke-width="1.3305"><g fill="#b6b6b6" stroke-width="1.3305"></g></g></g
            ></g
          ></g
        ></g
      ></svg>
  </div>
{/if}
