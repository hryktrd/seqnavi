import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Common} from '../common';
import {MapService} from '../map.service';

declare var Y;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit, OnInit {

  ymap: any;
  clickMarker: any;
  places: any[] = [];
  selectedPlaces: any[] = [];
  currentLatLng; any;

  placeName: string;

  @ViewChild('map', {static: false}) mapElement: ElementRef;

  constructor(private mapService: MapService) {
  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.ymap = new Y.Map(this.mapElement.nativeElement, {
      configure: {
        doubleClickZoom: true,
        scrollWheelZoom: true,
      }
    });
    this.ymap.drawMap(new Y.LatLng(35.66572, 139.73100), 17, Y.LayerSetId.NORMAL);
    this.ymap.addControl(new Y.CenterMarkControl);
    this.ymap.addControl(new Y.LayerSetControl);
    this.ymap.addControl(new Y.ScaleControl);
    this.ymap.addControl(new Y.ZoomControl);
    this.ymap.addControl(new Y.SearchControl);
    this.ymap.bind('click', (latlng) => {
      this.currentLatLng = latlng;
      this.ymap.removeFeature(this.clickMarker);
      this.clickMarker = new Y.Marker(new Y.LatLng(latlng.Lat, latlng.Lon));
      this.ymap.addFeature(this.clickMarker);
      this.mapService.searchPlaceInfo(latlng).subscribe((placeInfo) => {
        this.placeName = placeInfo.ResultSet.Result[0].Name;
      });
    });
  }

  addPlace(e) {
    const item = {
      latLng: this.currentLatLng,
      placeName: this.placeName,
    };
    this.places.push(item);
  }

  delPlace(e) {
    let newArray = [];
    this.places.concat(this.selectedPlaces)
      .forEach(item => {
        if (this.places.includes(item) && !this.selectedPlaces.includes(item)) {
          newArray.push(item);
        }
      });
    this.places = newArray;
  }

}
