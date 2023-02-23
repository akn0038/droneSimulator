import { Component, OnInit} from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { environment } from '../environments/environment';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  inputData: InputData[] = [];
  style = 'mapbox://styles/mapbox/streets-v12';
  map: mapboxgl.Map | undefined;

  constructor() {}
  private simulateDataOnMap() {
    this.map = new mapboxgl.Map({
      container: 'map',
      style: this.style,
      zoom: 0,
      accessToken: environment.mapbox.accessToken,
    });
    this.map.on('load', () => {
      const source: any = {
        data: {
          type: 'FeatureCollection',
          features: [
            {
              properties: {},
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: [],
              },
            },
          ],
        },
      };
      const startingCoordinates = this.inputData[0].data
      source.data.features[0].geometry.coordinates = [startingCoordinates];
      if (this.map) {
        this.map.addSource('trace', { type: 'geojson', data: source.data });
        this.map.addLayer({
          id: 'trace',
          type: 'line',
          source: 'trace',
          paint: {
            'line-color': 'red',
            'line-opacity': 0.75,
            'line-width': 5,
          },
        });
        this.map.jumpTo({ center: startingCoordinates, zoom: 10 });
        this.map.setPitch(30);
        let index = 0;
        let n = this.inputData.length
        const timer = setInterval(() => {
          if(index < n) {
            source.data.features[0].geometry.coordinates.push(this.inputData[index].data);
            if (this.map) {
              this.map.getSource('trace').setData(source.data);
              this.map.panTo(this.inputData[index].data);
            }
            index++;
          } else {
            window.clearInterval(timer);
          }
        }, this.inputData[index].delay);
      }
    });
  }

  onImport(event: any) {
    var file = event.srcElement.files[0];
    let self = this;
    if (file) {
      var reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = function (evt: any) {
        self.inputData = JSON.parse(evt.target.result);
      };
      reader.onerror = function (evt) {
        console.log('error reading file');
      };
    }
  }
  onSimulate() {
    if (this.inputData) {
      this.simulateDataOnMap();
    }
  }
}

export interface InputData {
  delay:number
  data: any
}
