import {AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {Common} from '../common';
import {MapService} from '../map.service';
import {SelectItem} from 'primeng/api';

declare var Y;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit, OnInit {

  // 地図オブジェクト
  ymap: any;
  // クリック時マーカー情報保持
  clickMarker: any;
  // 行き先として保持される場所一覧
  places: any[] = [];
  // OrderListでクリックしてアクティブになっている場所
  selectedPlaces: any[] = [];
  // クリックした緯度経度
  currentLatLng;
  any;
  // YOLPから返ってきた場所情報
  placeInfos: any[];
  // 場所名入力候補
  placeList: SelectItem[] = [];

  // 場所名
  placeName: any;

  // 地図上の直線
  polyline: any;

  // 場所情報URL
  placeUrl: string;

  @ViewChild('map', {static: false}) mapElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.ymap.updateSize();
  }

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
        this.placeInfos = placeInfo.ResultSet.Result;
        this.placeName = this.placeInfos[0].Name;
        this.placeInfos.forEach(place => {
          this.placeList.push({
            label: place.Name,
            value: place.Name,
          });
        });
      });
      this.mapService.searchRakutenTravelInfo(latlng).subscribe((travelInfo) => {
        travelInfo.hotels.forEach(hotel => {
          this.placeList.push({
            label: hotel.hotel[0].hotelBasicInfo.hotelName,
            value: hotel
          });
        });
      });
    });
  }

  addPlace(e) {
    console.log(this.currentLatLng);

    if(this.placeName.hotel !== undefined){
      this.currentLatLng.Lat = this.placeName.hotel[0].hotelBasicInfo.latitude;
      this.currentLatLng.Lon = this.placeName.hotel[0].hotelBasicInfo.longitude;
    }
    console.log(this.currentLatLng);

    const item = {
      latLng: this.currentLatLng,
      placeName: this.placeName.hotel !== undefined ? this.placeName.hotel[0].hotelBasicInfo.hotelName : this.placeName,
      placeUrl: this.placeName.hotel !== undefined  ? this.placeName.hotel[0].hotelBasicInfo.planListUrl : null,
    };
    this.places.push(item);
    this.plotLine();
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
    this.plotLine();
  }

  plotLine() {
    this.ymap.removeFeature(this.polyline);
    const style = new Y.Style('ff0000', 5, 0.5);
    var latLngs =[];
    this.places.forEach( p => {
      latLngs.push(new Y.LatLng(p.latLng.Lat, p.latLng.Lon));
    });
    this.polyline = new Y.Polyline(latLngs, {strokeStyle: style});
    this.ymap.addFeature(this.polyline);
  }
}
