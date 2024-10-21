import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListAsisPage } from './list-asis.page';

describe('ListAsisPage', () => {
  let component: ListAsisPage;
  let fixture: ComponentFixture<ListAsisPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListAsisPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
