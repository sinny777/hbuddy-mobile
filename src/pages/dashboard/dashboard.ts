import { Component } from '@angular/core';

import { PlaceAreasPage } from '../place-areas/place-areas';
import { ScenesPage } from '../scenes/scenes';
import { EnergyPage } from '../energy/energy';
import { GroupsPage } from '../groups/groups';


@Component({
  selector: 'page-dashboard',
  templateUrl: 'dashboard.html',
})
export class DashboardPage {

  tab1Root = PlaceAreasPage;
  tab2Root = ScenesPage;
  tab3Root = EnergyPage;
  tab4Root = GroupsPage;

  constructor() {
  }

}
