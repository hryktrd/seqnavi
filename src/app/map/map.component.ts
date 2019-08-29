import {AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {Common} from '../common';
import {MapService} from '../map.service';
import {SelectItem} from 'primeng/api';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs';

declare var Y;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit, OnInit {

  paramMapSubscription: Subscription;

  // baseUrl = 'http://localhost:4200';
  baseUrl = 'http://seqnavi.temp-web.site';
  currentUrl: string;

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
  hotelList: SelectItem[] = [];

  // 場所名
  placeName: any;

  // 楽天のホテル情報
  hotelObj: any;

  // 地図上の直線
  polyline: any;

  // ホテル写真URL
  hotelImageUrl: string;

  // 共有用URL
  shareUrl: string;

  @ViewChild('map', {static: false}) mapElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.ymap.updateSize();
  }

  constructor(private mapService: MapService,
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.paramMapSubscription = this.route.paramMap.subscribe(x => {
      if (x.get('places') && this.places.length === 0) {
        this.places = JSON.parse(decodeURIComponent(x.get('places')));
        this.currentUrl = this.baseUrl + this.router.url;
      } else {
        this.currentUrl = this.baseUrl;
      }
    });

    this.router.events.subscribe(() => {
      this.currentUrl = this.baseUrl + this.router.url;
    });

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
    this.ymap.addControl(new Y.ScaleControl);
    this.ymap.addControl(new Y.ZoomControl);
    this.ymap.addControl(new Y.SearchControl);
    this.ymap.bind('click', (latlng) => {
      this.currentLatLng = latlng;
      this.addMark(latlng);
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
          this.hotelList.push({
            label: hotel.hotel[0].hotelBasicInfo.hotelName,
            value: hotel
          });
        });
      });
    });

    if (this.places.length > 0) {
      this.plotLine();
    }

  }

  addMark(latlng) {
    this.ymap.removeFeature(this.clickMarker);
    this.clickMarker = new Y.Marker(new Y.LatLng(latlng.Lat, latlng.Lon));
    this.ymap.addFeature(this.clickMarker);
  }

  addPlace(e) {
    const latlng = Object.assign({}, this.currentLatLng);
    const item = {
      latLng: latlng,
      placeName: this.placeName,
    };
    this.places.push(item);
    this.plotLine();
  }

  addHotel(e) {
    if (this.hotelObj.hotel !== undefined){
      this.currentLatLng.Lat = this.hotelObj.hotel[0].hotelBasicInfo.latitude;
      this.currentLatLng.Lon = this.hotelObj.hotel[0].hotelBasicInfo.longitude;
    }
    const latlng = Object.assign({}, this.currentLatLng);
    const item = {
      latLng: latlng,
      placeName: this.hotelObj.hotel[0].hotelBasicInfo.hotelName,
      placeUrl: this.hotelObj.hotel[0].hotelBasicInfo.planListUrl,
    };
    this.places.push(item);
    this.hotelImageUrl = '';
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

  onHotelChange(e) {
    if (e.value.hotel !== undefined){
      this.currentLatLng.Lat = e.value.hotel[0].hotelBasicInfo.latitude;
      this.currentLatLng.Lon = e.value.hotel[0].hotelBasicInfo.longitude;
      this.hotelImageUrl = e.value.hotel[0].hotelBasicInfo.hotelImageUrl;
      this.addMark(this.currentLatLng);
    }
  }

  orderListSelect(e) {
    this.addMark(e.value[0].latLng);
  }

  /**
   * 場所一覧からシリアライズ用URL作成
   */
  makeUrl() {
    this.router.navigate(['map', {
      'places': encodeURIComponent(JSON.stringify(this.places))
        .replace(/[!'()*]/g, c => {
            return '%' + c.charCodeAt(0).toString(16);
          }
        )
    }]);
  }
  /**
   * 場所リストをリセットする
   */
  clearPlaces() {
    this.router.navigate(['/'], {});
  }
}
