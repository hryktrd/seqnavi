import {Injectable} from '@angular/core';
import {Common} from './common';
import {HttpClient} from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  common: Common = new Common();

  constructor(
    private http: HttpClient
  ) {
  }

  searchPlaceInfo(latlng): Observable<any> {
    return this.http.jsonp<any[]>(this.common.placeInfoUrl + '&lat=' + latlng.Lat + '&lon=' + latlng.Lon, 'callback');
  }

}
