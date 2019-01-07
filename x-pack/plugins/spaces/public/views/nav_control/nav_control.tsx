/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { I18nProvider } from '@kbn/i18n/react';
import { constant } from 'lodash';
import { SpacesManager } from 'plugins/spaces/lib/spaces_manager';
// @ts-ignore
import template from 'plugins/spaces/views/nav_control/nav_control.html';
import { NavControlPopover } from 'plugins/spaces/views/nav_control/nav_control_popover';
// @ts-ignore
import { PathProvider } from 'plugins/xpack_main/services/path';
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import ReactDOM from 'react-dom';
import { NavControlSide } from 'ui/chrome/directives/header_global_nav';
// @ts-ignore
import { uiModules } from 'ui/modules';
// @ts-ignore
import { chromeHeaderNavControlsRegistry } from 'ui/registry/chrome_header_nav_controls';
// @ts-ignore
import { chromeNavControlsRegistry } from 'ui/registry/chrome_nav_controls';
import { Space } from '../../../common/model/space';
import { SpacesGlobalNavButton } from './components/spaces_global_nav_button';
import { SpacesHeaderNavButton } from './components/spaces_header_nav_button';

chromeNavControlsRegistry.register(
  constant({
    name: 'spaces',
    order: 90,
    template,
  })
);

const module = uiModules.get('spaces_nav', ['kibana']);

export interface SpacesNavState {
  getActiveSpace: () => Space;
  refreshSpacesList: () => void;
}

let spacesManager: SpacesManager;

module.controller(
  'spacesNavController',
  ($scope: any, $http: any, chrome: any, Private: any, activeSpace: any) => {
    const pathProvider = Private(PathProvider);

    const domNode = document.getElementById(`spacesNavReactRoot`);
    const spaceSelectorURL = chrome.getInjected('spaceSelectorURL');

    spacesManager = new SpacesManager($http, chrome, spaceSelectorURL);

    let mounted = false;

    $scope.$parent.$watch('isVisible', function isVisibleWatcher(isVisible: boolean) {
      if (isVisible && !mounted && !pathProvider.isUnauthenticated()) {
        render(
          <I18nProvider>
            <NavControlPopover
              spacesManager={spacesManager}
              activeSpace={activeSpace}
              anchorPosition={'rightCenter'}
              buttonClass={SpacesGlobalNavButton}
            />
          </I18nProvider>,
          domNode
        );
        mounted = true;
      }
    });

    // unmount react on controller destroy
    $scope.$on('$destroy', () => {
      if (domNode) {
        unmountComponentAtNode(domNode);
      }
      mounted = false;
    });
  }
);

module.service('spacesNavState', (activeSpace: any) => {
  return {
    getActiveSpace: () => {
      return activeSpace.space;
    },
    refreshSpacesList: () => {
      if (spacesManager) {
        spacesManager.requestRefresh();
      }
    },
  } as SpacesNavState;
});

chromeHeaderNavControlsRegistry.register(
  ($http: any, chrome: any, Private: any, activeSpace: any) => ({
    name: 'spaces',
    order: 1000,
    side: NavControlSide.Left,
    render(el: HTMLElement) {
      const pathProvider = Private(PathProvider);

      if (pathProvider.isUnauthenticated()) {
        return;
      }

      const spaceSelectorURL = chrome.getInjected('spaceSelectorURL');

      spacesManager = new SpacesManager($http, chrome, spaceSelectorURL);

      ReactDOM.render(
        <I18nProvider>
          <NavControlPopover
            spacesManager={spacesManager}
            activeSpace={activeSpace}
            anchorPosition="downLeft"
            buttonClass={SpacesHeaderNavButton}
          />
        </I18nProvider>,
        el
      );
    },
  })
);