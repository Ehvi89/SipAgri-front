import {ComponentFixture, TestBed} from '@angular/core/testing';

import {Sidebar} from './sidebar';

describe('Sidebar', () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sidebar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

    it('should initialize menus correctly on component initialization', () => {
        expect(component.menus).toBeDefined();
        expect(component.menus.length).toBe(5);
    });

    it('should contain correct menu items in the menus array', () => {
        const expectedMenus = [
            {label: "Dashboard", link: "/dashboard", icon: "dashboard", fa: false},
            {label: "Planteurs", link: "/planters", icon: "fa-people-group", fa: true},
            {label: "Plantations", link: "/plantations", icon: "fa-tractor", fa: true},
            {label: "Productions", link: "/productions", icon: "fa-wheat-awn", fa: true},
            {label: "Paramètres", link: "/settings", icon: "settings", fa: false}
        ];

        expect(component.menus).toEqual(expectedMenus);
    });
});
