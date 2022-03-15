/**********************************************************************
 * Copyright (C) 2022 Red Hat, Inc.
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

export class CommandRegistry {
  init(): void {
    //eslint-disable-next-line
    const ninja: any = document.getElementById('command-palette');
    ninja.data = [
      {
        id: 'Projects',
        title: 'Open Projects',
        hotkey: 'ctrl+N',
        icon: 'apps',
        section: 'Projects',
        handler: () => {
          // it's auto register above hotkey with this handler
          alert('Your logic to handle');
        },
      },
      {
        id: 'Theme',
        title: 'Change theme...',
        icon: 'desktop_windows',
        children: ['Light Theme', 'Dark Theme', 'System Theme'],
        hotkey: 'ctrl+T',
        handler: () => {
          // open menu if closed. Because you can open directly that menu from it's hotkey
          ninja.open({ parent: 'Theme' });
          // if menu opened that prevent it from closing on select that action, no need if you don't have child actions
          return { keepOpen: true };
        },
      },
      {
        id: 'Light Theme',
        title: 'Change theme to Light',
        icon: 'light_mode',
        parent: 'Theme',
        handler: () => {
          // simple handler
          document.documentElement.classList.remove('dark');
        },
      },
      {
        id: 'Dark Theme',
        title: 'Change theme to Dark',
        icon: 'dark_mode',
        parent: 'Theme',
        handler: () => {
          // simple handler
          document.documentElement.classList.add('dark');
        },
      },
    ];
  }
}
