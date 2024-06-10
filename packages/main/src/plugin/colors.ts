/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

import type { ColorDefinition } from '/@api/color-info.js';

import colorPalette from '../../../../tailwind-color-palette.json';

export type ColorDict = { [colorId: string]: ColorDefinition };

// Global navbar
export function getGlobalNav(): ColorDict {
  const glNav = 'global-nav-';
  return {
    [`${glNav}bg`]: {
      dark: colorPalette.charcoal[600],
      light: colorPalette.gray[100],
    },
    [`${glNav}icon-notification-dot`]: {
      dark: colorPalette.purple[500],
      light: colorPalette.purple[600],
    },
    [`${glNav}icon`]: {
      dark: colorPalette.gray[600],
      light: colorPalette.charcoal[200],
    },
    [`${glNav}icon-hover`]: {
      dark: colorPalette.white,
      light: colorPalette.purple[800],
    },
    [`${glNav}icon-hover-bg`]: {
      dark: colorPalette.purple[700],
      light: colorPalette.purple[300],
    },
    [`${glNav}icon-inset-bg`]: {
      dark: colorPalette.charcoal[800],
      light: colorPalette.dustypurple[200],
    },
    [`${glNav}icon-selected`]: {
      dark: colorPalette.white,
      light: colorPalette.purple[800],
    },
    [`${glNav}icon-selected-bg`]: {
      dark: colorPalette.charcoal[500],
      light: colorPalette.purple[300],
    },
    [`${glNav}icon-selected-highlight`]: {
      dark: colorPalette.purple[500],
      light: colorPalette.purple[600],
    },
  };
}

export function getTitlebar(): ColorDict {
  return {
    ['titlebar-bg']: {
      dark: colorPalette.charcoal[900],
      light: colorPalette.gray[50],
    },
    ['titlebar-text']: {
      dark: colorPalette.white,
      light: colorPalette.purple[900],
    },
    ['titlebar-icon']: {
      dark: colorPalette.white,
      light: colorPalette.purple[900],
    },
  };
}

// secondary nav (settings)
export function getSecondaryNav(): ColorDict {
  const sNav = 'secondary-nav-';

  return {
    [`${sNav}bg`]: {
      dark: colorPalette.charcoal[700],
      light: colorPalette.dustypurple[100],
    },
    [`${sNav}header-text`]: {
      dark: colorPalette.white,
      light: colorPalette.charcoal[900],
    },
    [`${sNav}text`]: {
      dark: colorPalette.gray[300],
      light: colorPalette.charcoal[700],
    },
    [`${sNav}text-hover`]: {
      dark: colorPalette.white,
      light: colorPalette.purple[800],
    },
    [`${sNav}text-hover-bg`]: {
      dark: colorPalette.purple[700],
      light: colorPalette.purple[300],
    },
    [`${sNav}text-selected`]: {
      dark: colorPalette.white,
      light: colorPalette.purple[800],
    },
    [`${sNav}selected-bg`]: {
      dark: colorPalette.charcoal[500],
      light: colorPalette.purple[300],
    },
    [`${sNav}selected-highlight`]: {
      dark: colorPalette.purple[500],
      light: colorPalette.purple[600],
    },
    [`${sNav}icon-notification-dot`]: {
      dark: colorPalette.purple[500],
      light: colorPalette.purple[600],
    },
    [`${sNav}expander`]: {
      dark: colorPalette.white,
      light: colorPalette.charcoal[700],
    },
  };
}

export function getCardContent(): ColorDict {
  return {
    [`card-bg`]: {
      dark: colorPalette.charcoal[800],
      light: colorPalette.gray[300],
    },
    [`card-header-text`]: {
      dark: colorPalette.white,
      light: colorPalette.charcoal[900],
    },
    [`card-text`]: {
      dark: colorPalette.gray[300],
      light: colorPalette.charcoal[700],
    },
  };
}

export function getInvertContent(): ColorDict {
  const invCt = 'invert-content-';
  return {
    [`${invCt}bg`]: {
      dark: colorPalette.charcoal[800],
      light: colorPalette.gray[50],
    },
    [`${invCt}header-text`]: {
      dark: colorPalette.white,
      light: colorPalette.charcoal[900],
    },
    [`${invCt}header2-text`]: {
      dark: colorPalette.white,
      light: colorPalette.charcoal[900],
    },
    [`${invCt}card-bg`]: {
      dark: colorPalette.charcoal[600],
      light: colorPalette.gray[300],
    },
    [`${invCt}card-header-text`]: {
      dark: colorPalette.white,
      light: colorPalette.charcoal[900],
    },
    [`${invCt}card-text`]: {
      dark: colorPalette.gray[300],
      light: colorPalette.charcoal[700],
    },
    [`${invCt}button-active`]: {
      dark: colorPalette.purple[500],
      light: colorPalette.purple[600],
    },
    [`${invCt}button-inactive`]: {
      dark: colorPalette.charcoal[50],
      light: colorPalette.charcoal[50],
    },
    [`${invCt}info-icon`]: {
      dark: colorPalette.purple[500],
      light: colorPalette.purple[600],
    },
  };
}

export function getContent(): ColorDict {
  const ct = 'content-';
  return {
    [`${ct}breadcrumb`]: {
      dark: colorPalette.gray[600],
      light: colorPalette.purple[900],
    },
    [`${ct}breadcrumb-2`]: {
      dark: colorPalette.purple[400],
      light: colorPalette.purple[600],
    },
    [`${ct}header`]: {
      dark: colorPalette.white,
      light: colorPalette.charcoal[900],
    },
    [`${ct}sub-header`]: {
      dark: colorPalette.gray[900],
      light: colorPalette.purple[900],
    },
    [`${ct}header-icon`]: {
      dark: colorPalette.gray[600],
      light: colorPalette.purple[700],
    },
    [`${ct}card-header-text`]: {
      dark: colorPalette.gray[100],
      light: colorPalette.charcoal[900],
    },
    [`${ct}card-bg`]: {
      dark: colorPalette.charcoal[800],
      light: colorPalette.gray[50],
    },
    [`${ct}card-hover-bg`]: {
      dark: colorPalette.charcoal[500],
      light: colorPalette.purple[200],
    },
    [`${ct}card-text`]: {
      dark: colorPalette.gray[400],
      light: colorPalette.purple[900],
    },
    [`${ct}card-title`]: {
      dark: colorPalette.gray[400],
      light: colorPalette.charcoal[900],
    },
    [`${ct}card-light-title`]: {
      dark: colorPalette.gray[800],
      light: colorPalette.purple[900],
    },
    [`${ct}card-inset-bg`]: {
      dark: colorPalette.charcoal[900],
      light: colorPalette.dustypurple[200],
    },
    [`${ct}bg`]: {
      dark: colorPalette.charcoal[700],
      light: colorPalette.gray[300],
    },
    [`${ct}card-icon`]: {
      dark: colorPalette.gray[400],
      light: colorPalette.purple[900],
    },
    [`${ct}divider`]: {
      dark: colorPalette.charcoal[400],
      light: colorPalette.gray[700],
    },
    [`${ct}card-carousel-card-bg`]: {
      dark: colorPalette.charcoal[600],
      light: colorPalette.gray[300],
    },
    [`${ct}card-carousel-card-hover-bg`]: {
      dark: colorPalette.charcoal[500],
      light: colorPalette.gray[200],
    },
    [`${ct}card-carousel-card-header-text`]: {
      dark: colorPalette.gray[100],
      light: colorPalette.charcoal[900],
    },
    [`${ct}card-carousel-card-text`]: {
      dark: colorPalette.gray[400],
      light: colorPalette.purple[900],
    },
    [`${ct}card-carousel-nav`]: {
      dark: colorPalette.gray[800],
      light: colorPalette.gray[400],
    },
    [`${ct}card-carousel-hover-nav`]: {
      dark: colorPalette.gray[600],
      light: colorPalette.gray[600],
    },
    [`${ct}card-carousel-disabled-nav`]: {
      dark: colorPalette.charcoal[700],
      light: colorPalette.gray[200],
    },
  };
}

export function getInputBox(): ColorDict {
  const sNav = 'input-field-';
  return {
    [`${sNav}bg`]: {
      dark: colorPalette.transparent,
      light: colorPalette.transparent,
    },
    [`${sNav}focused-bg`]: {
      dark: colorPalette.charcoal[900],
      light: colorPalette.gray[100],
    },
    [`${sNav}disabled-bg`]: {
      dark: colorPalette.charcoal[900],
      light: colorPalette.charcoal[900],
    },
    [`${sNav}hover-bg`]: {
      dark: colorPalette.transparent,
      light: colorPalette.transparent,
    },
    [`${sNav}focused-text`]: {
      dark: colorPalette.white,
      light: colorPalette.gray[900],
    },
    [`${sNav}error-text`]: {
      dark: colorPalette.red[500],
      light: colorPalette.red[500],
    },
    [`${sNav}disabled-text`]: {
      dark: colorPalette.gray[900],
      light: colorPalette.gray[900],
    },
    [`${sNav}hover-text`]: {
      dark: colorPalette.gray[900],
      light: colorPalette.gray[900],
    },
    [`${sNav}placeholder-text`]: {
      dark: colorPalette.gray[900],
      light: colorPalette.gray[900],
    },
    [`${sNav}stroke`]: {
      dark: colorPalette.charcoal[400],
      light: colorPalette.charcoal[400],
    },
    [`${sNav}hover-stroke`]: {
      dark: colorPalette.purple[400],
      light: colorPalette.purple[400],
    },
    [`${sNav}stroke-error`]: {
      dark: colorPalette.red[500],
      light: colorPalette.red[500],
    },
    [`${sNav}stroke-readonly`]: {
      dark: colorPalette.charcoal[100],
      light: colorPalette.charcoal[100],
    },
    [`${sNav}icon`]: {
      dark: colorPalette.gray[500],
      light: colorPalette.gray[500],
    },
    [`${sNav}focused-icon`]: {
      dark: colorPalette.gray[500],
      light: colorPalette.gray[500],
    },
    [`${sNav}disabled-icon`]: {
      dark: colorPalette.gray[500],
      light: colorPalette.gray[500],
    },
    [`${sNav}hover-icon`]: {
      dark: colorPalette.gray[500],
      light: colorPalette.gray[500],
    },
  };
}

// checkboxes
export function getCheckbox(): ColorDict {
  const sNav = 'input-checkbox-';
  return {
    [`${sNav}disabled`]: {
      dark: colorPalette.gray[700],
      light: colorPalette.charcoal[200],
    },
    [`${sNav}indeterminate`]: {
      dark: colorPalette.purple[500],
      light: colorPalette.purple[900],
    },
    [`${sNav}focused-indeterminate`]: {
      dark: colorPalette.purple[400],
      light: colorPalette.purple[700],
    },
    [`${sNav}checked`]: {
      dark: colorPalette.purple[500],
      light: colorPalette.purple[900],
    },
    [`${sNav}focused-checked`]: {
      dark: colorPalette.purple[400],
      light: colorPalette.purple[700],
    },
    [`${sNav}unchecked`]: {
      dark: colorPalette.gray[400],
      light: colorPalette.purple[900],
    },
    [`${sNav}focused-unchecked`]: {
      dark: colorPalette.purple[400],
      light: colorPalette.purple[700],
    },
  };
}

// toggles
export function getToggle(): ColorDict {
  const sNav = 'input-toggle-';
  return {
    [`${sNav}off-bg`]: {
      dark: colorPalette.gray[900],
      light: colorPalette.gray[900],
    },
    [`${sNav}off-focused-bg`]: {
      dark: colorPalette.purple[700],
      light: colorPalette.purple[700],
    },
    [`${sNav}on-bg`]: {
      dark: colorPalette.purple[500],
      light: colorPalette.purple[500],
    },
    [`${sNav}on-focused-bg`]: {
      dark: colorPalette.purple[400],
      light: colorPalette.purple[600],
    },
    [`${sNav}switch`]: {
      dark: colorPalette.white,
      light: colorPalette.black,
    },
    [`${sNav}focused-switch`]: {
      dark: colorPalette.white,
      light: colorPalette.black,
    },
    [`${sNav}on-text`]: {
      dark: colorPalette.white,
      light: colorPalette.black,
    },
    [`${sNav}off-text`]: {
      dark: colorPalette.gray[700],
      light: colorPalette.gray[900],
    },
    [`${sNav}off-disabled-bg`]: {
      dark: colorPalette.charcoal[900],
      light: colorPalette.gray[900],
    },
    [`${sNav}on-disabled-bg`]: {
      dark: colorPalette.charcoal[900],
      light: colorPalette.gray[900],
    },
    [`${sNav}disabled-switch`]: {
      dark: colorPalette.gray[900],
      light: colorPalette.charcoal[900],
    },
  };
}

export function getTable(): ColorDict {
  const tab = 'table-';
  return {
    [`${tab}header-text`]: {
      dark: colorPalette.gray[600],
      light: colorPalette.charcoal[200],
    },
    // color of up/down arrows when column is not the ordered one
    [`${tab}header-unsorted`]: {
      dark: colorPalette.charcoal[200],
      light: colorPalette.charcoal[300],
    },

    // color for most text in tables
    [`${tab}body-text`]: {
      dark: colorPalette.gray[700],
      light: colorPalette.charcoal[300],
    },
    // color for the text in the main column of the table (generally Name)
    [`${tab}body-text-highlight`]: {
      dark: colorPalette.gray[300],
      light: colorPalette.charcoal[300],
    },
    // color for the text in second line of main column, in secondary color (generally IDs)
    [`${tab}body-text-sub-secondary`]: {
      dark: colorPalette.purple[400],
      light: colorPalette.purple[700],
    },
    // color for highlighted text in second line of main column
    [`${tab}body-text-sub-highlight`]: {
      dark: colorPalette.gray[400],
      light: colorPalette.charcoal[200],
    },
  };
}

export function getDetails(): ColorDict {
  const details = 'details-';
  return {
    [`${details}body-text`]: {
      dark: colorPalette.gray[200],
      light: colorPalette.charcoal[500],
    },
    [`${details}empty-icon`]: {
      dark: colorPalette.gray[600],
      light: colorPalette.charcoal[200],
    },
    [`${details}empty-header`]: {
      dark: colorPalette.gray[200],
      light: colorPalette.charcoal[500],
    },
    [`${details}empty-sub-header`]: {
      dark: colorPalette.gray[600],
      light: colorPalette.charcoal[500],
    },
    [`${details}empty-cmdline-bg`]: {
      dark: colorPalette.charcoal[900],
      light: colorPalette.gray[200],
    },
    [`${details}empty-cmdline-text`]: {
      dark: colorPalette.gray[400],
      light: colorPalette.charcoal[700],
    },
    [`${details}bg`]: {
      dark: colorPalette.charcoal[900],
      light: colorPalette.gray[50],
    },
  };
}

export function getTab(): ColorDict {
  const tab = 'tab-';
  return {
    [`${tab}text`]: {
      dark: colorPalette.gray[600],
      light: colorPalette.charcoal[200],
    },
    [`${tab}text-highlight`]: {
      dark: colorPalette.white,
      light: colorPalette.charcoal[300],
    },
    [`${tab}highlight`]: {
      dark: colorPalette.purple[500],
      light: colorPalette.purple[600],
    },
    [`${tab}hover`]: {
      dark: colorPalette.purple[400],
      light: colorPalette.purple[500],
    },
  };
}

export function getModal(): ColorDict {
  const modal = 'modal-';
  return {
    [`${modal}fade`]: {
      dark: colorPalette.black,
      light: colorPalette.white,
    },
    [`${modal}text`]: {
      dark: colorPalette.gray[500],
      light: colorPalette.charcoal[300],
    },
    [`${modal}text-hover`]: {
      dark: colorPalette.gray[300],
      light: colorPalette.purple[800],
    },
    [`${modal}bg`]: {
      dark: colorPalette.charcoal[800],
      light: colorPalette.gray[50],
    },
    [`${modal}border`]: {
      dark: colorPalette.charcoal[500],
      light: colorPalette.gray[500],
    },
    [`${modal}header-bg`]: {
      dark: colorPalette.black,
      light: colorPalette.gray[100],
    },
    [`${modal}header-text`]: {
      dark: colorPalette.gray[400],
      light: colorPalette.purple[500],
    },
    [`${modal}header-divider`]: {
      dark: colorPalette.purple[700],
      light: colorPalette.purple[300],
    },
    [`${modal}error-text`]: {
      dark: colorPalette.red[500],
      light: colorPalette.red[500],
    },
    [`${modal}warning-text`]: {
      dark: colorPalette.amber[400],
      light: colorPalette.amber[400],
    },
  };
}

// links
export function getLink(): ColorDict {
  const link = 'link';
  return {
    [`${link}`]: {
      dark: colorPalette.purple[400],
      light: colorPalette.purple[700],
    },
    [`${link}-hover-bg`]: {
      dark: colorPalette.white + '2',
      light: colorPalette.black + '2',
    },
  };
}

export function getButton(): ColorDict {
  const button = 'button-';
  return {
    [`${button}primary-bg`]: {
      dark: colorPalette.purple[600],
      light: colorPalette.purple[600],
    },
    [`${button}primary-hover-bg`]: {
      dark: colorPalette.purple[500],
      light: colorPalette.purple[500],
    },
    [`${button}secondary`]: {
      dark: colorPalette.gray[200],
      light: colorPalette.purple[600],
    },
    [`${button}secondary-hover`]: {
      dark: colorPalette.purple[500],
      light: colorPalette.purple[500],
    },
    [`${button}text`]: {
      dark: colorPalette.white,
      light: colorPalette.white,
    },
    [`${button}disabled`]: {
      dark: colorPalette.charcoal[50],
      light: colorPalette.gray[900],
    },
    [`${button}disabled-text`]: {
      dark: colorPalette.charcoal[50],
      light: colorPalette.gray[900],
    },
    [`${button}danger-border`]: {
      dark: colorPalette.red[500],
      light: colorPalette.red[700],
    },
    [`${button}danger-bg`]: {
      dark: colorPalette.transparent,
      light: colorPalette.transparent,
    },
    [`${button}danger-text`]: {
      dark: colorPalette.red[500],
      light: colorPalette.red[700],
    },
    [`${button}danger-hover-text`]: {
      dark: colorPalette.white,
      light: colorPalette.white,
    },
    [`${button}danger-hover-bg`]: {
      dark: colorPalette.red[600],
      light: colorPalette.red[600],
    },
    [`${button}danger-disabled-border`]: {
      dark: colorPalette.charcoal[50],
      light: colorPalette.gray[900],
    },
    [`${button}danger-disabled-text`]: {
      dark: colorPalette.charcoal[50],
      light: colorPalette.gray[900],
    },
    [`${button}danger-disabled-bg`]: {
      dark: colorPalette.transparent,
      light: colorPalette.transparent,
    },
    [`${button}tab-border`]: {
      dark: colorPalette.charcoal[700],
      light: colorPalette.gray[400],
    },
    [`${button}tab-border-selected`]: {
      dark: colorPalette.purple[500],
      light: colorPalette.purple[600],
    },
    [`${button}tab-hover-border`]: {
      dark: colorPalette.charcoal[100],
      light: colorPalette.black,
    },
    [`${button}tab-text`]: {
      dark: colorPalette.gray[600],
      light: colorPalette.charcoal[200],
    },
    [`${button}link-text`]: {
      dark: colorPalette.purple[400],
      light: colorPalette.purple[700],
    },
    [`${button}link-hover-bg`]: {
      dark: colorPalette.white + '2',
      light: colorPalette.black + '2',
    },
    [`${button}help-link-text`]: {
      dark: colorPalette.gray[100],
      light: colorPalette.charcoal[900],
    },
  };
}

export function getActionButton(): ColorDict {
  const ab = 'action-button-';
  return {
    [`${ab}text`]: {
      dark: colorPalette.gray[400],
      light: colorPalette.charcoal[900],
    },
    [`${ab}hover-bg`]: {
      dark: colorPalette.charcoal[600],
      light: colorPalette.gray[50],
    },
    [`${ab}hover-text`]: {
      dark: colorPalette.purple[600],
      light: colorPalette.purple[500],
    },
    [`${ab}disabled-text`]: {
      dark: colorPalette.gray[900],
      light: colorPalette.gray[900],
    },
    [`${ab}details-text`]: {
      dark: colorPalette.gray[400],
      light: colorPalette.charcoal[900],
    },
    [`${ab}details-bg`]: {
      dark: colorPalette.charcoal[800],
      light: colorPalette.gray[50],
    },
    [`${ab}details-hover-text`]: {
      dark: colorPalette.purple[600],
      light: colorPalette.purple[500],
    },
    [`${ab}details-disabled-text`]: {
      dark: colorPalette.gray[900],
      light: colorPalette.gray[900],
    },
    [`${ab}details-disabled-bg`]: {
      dark: colorPalette.charcoal[800],
      light: colorPalette.gray[50],
    },
    [`${ab}spinner`]: {
      dark: colorPalette.purple[500],
      light: colorPalette.purple[500],
    },
  };
}

export function getTooltip(): ColorDict {
  const tooltip = 'tooltip-';
  return {
    [`${tooltip}bg`]: {
      dark: colorPalette.charcoal[800],
      light: colorPalette.gray[50],
    },
    [`${tooltip}text`]: {
      dark: colorPalette.white,
      light: colorPalette.black,
    },
    [`${tooltip}border`]: {
      dark: colorPalette.charcoal[500],
      light: colorPalette.gray[500],
    },
  };
}

export function getDropdown(): ColorDict {
  const dropdown = 'dropdown-';
  return {
    [`${dropdown}bg`]: {
      dark: colorPalette.charcoal[600],
      light: colorPalette.gray[100],
    },
    [`${dropdown}ring`]: {
      dark: colorPalette.purple[900],
      light: colorPalette.gray[500],
    },
    [`${dropdown}hover-ring`]: {
      dark: colorPalette.purple[700],
      light: colorPalette.purple[300],
    },
    [`${dropdown}divider`]: {
      dark: colorPalette.charcoal[600],
      light: colorPalette.gray[100],
    },
    [`${dropdown}item-text`]: {
      dark: colorPalette.gray[400],
      light: colorPalette.charcoal[600],
    },
    [`${dropdown}item-hover-bg`]: {
      dark: colorPalette.black,
      light: colorPalette.gray[300],
    },
    [`${dropdown}item-hover-text`]: {
      dark: colorPalette.purple[500],
      light: colorPalette.purple[500],
    },
    [`${dropdown}disabled-item-text`]: {
      dark: colorPalette.gray[900],
      light: colorPalette.charcoal[100],
    },
    [`${dropdown}disabled-item-bg`]: {
      dark: colorPalette.charcoal[800],
      light: colorPalette.gray[200],
    },
  };
}

export function getColors(): ColorDict {
  return {
    ...getGlobalNav(),
    ...getSecondaryNav(),
    ...getTitlebar(),
    ...getContent(),
    ...getInvertContent(),
    ...getCardContent(),
    ...getInputBox(),
    ...getCheckbox(),
    ...getToggle(),
    ...getTable(),
    ...getDetails(),
    ...getTab(),
    ...getModal(),
    ...getLink(),
    ...getButton(),
    ...getActionButton(),
    ...getTooltip(),
    ...getDropdown(),
  };
}
