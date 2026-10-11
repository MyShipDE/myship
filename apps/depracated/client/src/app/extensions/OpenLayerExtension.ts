import {fromLonLat, toLonLat} from 'ol/proj';
import {Feature, Map, Overlay, View} from 'ol';
import {LocalStorageKey} from '../Resource';
import {Layer, Tile, Vector} from 'ol/layer';
import {Vector as VectorSource, XYZ} from 'ol/source';
import {Control, Zoom} from 'ol/control';
import {Circle, LineString, Point, Polygon} from 'ol/geom';
import {Fill, Icon, Stroke, Style} from 'ol/style';
import {Socket} from 'socket.io-client';
import {Subscription} from 'rxjs';
import {fromCircle} from 'ol/geom/Polygon';
import {Coordinate} from '../client-sdk/classes/Coordinate';
import $ from 'jquery';
import {DistanceUnit} from '../client-sdk/classes/DistanceUnit';
import {ConvertingService} from '../service/converting.service';
import {Track} from '../client-sdk/models/Track';
import {LoaderService} from '../service/loader.service';
import {TrackService} from '../client-sdk/services/track.service';
import {ExtractDataService} from '../service/extractData.service';
import {UnitService} from '../service/unit.service';
import {DatetimeService} from '../service/datetime.service';
import {SocketChannel} from '../client-sdk/resources/SocketChannel';
import {SocketService} from '../service/socket.service';
import VectorLayer from 'ol/layer/Vector';
import {EventEmitter, Output} from '@angular/core';
import {TrackRecord} from '../client-sdk/models/TrackRecord';

export abstract class OpenLayerExtension {

  protected _waypointSelected: EventEmitter<TrackRecord> = new EventEmitter<TrackRecord>();

  protected layers = {
    google: new Tile({
      source: new XYZ({
        url: 'https://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      })
    }),
    osm: new Tile({
      source: new XYZ({
        url: 'http://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
      })
    }),
    openSeaMap: new Tile({
      source: new XYZ({
        url: 'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',
      })
    }),
  };

  protected positionIcon = new Style({
    image: new Icon({
      anchor: [0.5, 256],
      scale: 0.08,
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
      src: 'assets/icons/red/navigation.svg'
    })
  });

  protected map: Map;
  protected positionLayer: Layer;
  protected directionLine: any;
  protected distanceRing1: Layer;
  protected distanceRing2: Layer;
  protected trackLines: Layer[] = [];
  protected trackDirectionSymbols: Layer[] = [];
  protected trackDirectionSymbolsVisible = false;
  protected wsEmitter: Socket;
  protected serviceObserver: Subscription = null;
  protected selectedWaypoint: Layer;
  protected selectedWaypointLine: Layer;
  protected selectedWaypointPopup: Overlay;
  protected selectedWaypointPopupElement: HTMLElement;
  protected markedWaypointLayers: Layer[] = [];
  protected markedWaypointLineLayers: Layer[] = [];
  protected activeTrack: Track;
  protected waypointsLayer: Layer = null;
  protected trackWaypoints: Layer[] = [];
  protected trackWaypointFeatures: Feature[] = [];

  protected lat = '';
  protected lon = '';
  protected decimalLat = 0;
  protected decimalLon = 0;
  protected course = 0; // 215;
  protected courseInRad = 0; // 3.752457891787808;
  protected speedOverGround = 0; // 2.05;
  protected satellite = 0;
  protected datetime = '';
  protected clickedCoordinate: number[];
  protected distance = -1;
  protected duration: string;

  protected mapInit = false;
  protected routeEditing = false;
  protected loadingTrack = false;
  protected inArchiveMode = false;
  protected viewInit = false;
  protected northOriented = true;
  protected menuOpen = true;
  protected fixedMap = true;
  protected mapRotationType: MapRotationType = MapRotationType.NorthOriented;
  protected dataWidget: DataWidget = null;
  protected selectedWaypointCoordinates: Coordinate[] = [];
  protected distanceUnit: DistanceUnit = DistanceUnit.Miles;

  private trackView: boolean = null;

  protected constructor(protected converter: ConvertingService,
                        protected loader: LoaderService,
                        protected trackSDK: TrackService,
                        protected extract: ExtractDataService,
                        protected unit: UnitService,
                        protected dateTimeService: DatetimeService,
                        protected websocket: SocketService) {
    //
  }

  createMap(lat: number, lon: number, layers: Layer[] = [], controls: Control[] = []): void {

    if (lat == null || lon == null) {
      throw new Error('Lat or Lon is null');
    }

    let zoom = 14;
    const savedZoomScale = localStorage.getItem(LocalStorageKey.ZoomScale);
    if (savedZoomScale != null && +savedZoomScale > 0) {
      zoom = +savedZoomScale;
    }

    this.map = new Map({
      layers: [],
      target: 'map',
      view: new View({
        center: fromLonLat([lon, lat]),
        zoom,
      }),
    });

    for (const layer of layers) {
      this.map.addLayer(layer);
    }

    this.map.getControls().clear();

    this.map.on('moveend', () => {
      localStorage.setItem(LocalStorageKey.ZoomScale, this.map.getView().getZoom().toString());
    });

    for (const control of controls) {
      this.map.addControl(control);
    }

    this.listenOnMapSelection();

    this.mapInit = true;
    this.routeEditing = false;

    this.markedWaypointLayers.forEach(x => this.map.addLayer(x));
    this.markedWaypointLineLayers.forEach(x => this.map.addLayer(x));

    this.dataWidget = DataWidget.WindGauge;

  }

  updateMapView(lat: number, lng: number): void {
    this.map.getView().centerOn(fromLonLat([lng, lat]), this.map.getSize(), [this.map.getSize()[0] / 2, this.map.getSize()[1] / 2]);
  }

  mapDrawPosition(lat: number, lon: number): void {
    const iconFeature = new Feature({
      geometry: new Point(fromLonLat([lon, lat]))
    });
    iconFeature.setStyle(this.positionIcon);

    const vectorSource = new VectorSource({
      features: [iconFeature]
    });
    const positionLayer = new Vector({
      source: vectorSource
    });

    this.map.addLayer(positionLayer);

    if (this.positionLayer != null) {
      this.map.removeLayer(this.positionLayer);
    }

    this.positionLayer = positionLayer;

    if (this.distanceRing1 != null) {
      this.map.removeLayer(this.distanceRing1);
    }
    if (this.distanceRing2 != null) {
      this.map.removeLayer(this.distanceRing2);
    }

    this.distanceRing1 = this.drawRingAroundPoint(fromLonLat([lon, lat]), 300);
    this.distanceRing2 = this.drawRingAroundPoint(fromLonLat([lon, lat]), 1000);

    this.map.addLayer(this.distanceRing1);
    this.map.addLayer(this.distanceRing2);
  }

  mapDrawDirectionSymbol(lat: number, lon: number, course: number = 0, addLayer: boolean): void {

    const trackDirectionIcon = new Style({
      image: new Icon({
        anchor: [0.5, 256],
        width: 24,
        height: 24,
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        src: 'assets/icons/direction_symbol.svg'
      })
    });

    trackDirectionIcon.getImage().setRotation(course * (Math.PI / 180));

    const iconFeature = new Feature({
      geometry: new Point(fromLonLat([lon, lat]))
    });
    iconFeature.setStyle(trackDirectionIcon);

    const vectorSource = new VectorSource({
      features: [iconFeature]
    });
    const positionLayer = new Vector({
      source: vectorSource,
      zIndex: 999
    });

    if (addLayer) {
      this.trackDirectionSymbolsVisible = true;
    } else {
      positionLayer.setVisible(false);
      this.trackDirectionSymbolsVisible = false;
    }

    this.map.addLayer(positionLayer);

    this.trackDirectionSymbols.push(positionLayer);
  }

  drawDirectionLine(lat: number, lon: number): void {

    if (this.directionLine != null) {
      this.map.removeLayer(this.directionLine);
    }

    const startPoint = fromLonLat([lon, lat]); // Startpunkt (Längengrad, Breitengrad)
    const endPoint = this.calculateEndPoint(startPoint, this.course, this.map); // Endpunkt am Kartenrand (Längengrad, Breitengrad)

    const lineString = new LineString([startPoint, endPoint]);

    const lineFeature = new Feature({
      geometry: lineString
    });

    const vectorSource = new VectorSource({
      features: [lineFeature]
    });

    this.directionLine = new Vector({
      source: vectorSource,
      style: new Style({
        stroke: new Stroke({
          color: 'red',
          width: 3
        })
      })
    });

    this.map.addLayer(this.directionLine);
  }

  calculateEndPoint(startCoords: number[], angleInDegrees: number, map: Map): number[] {
    const angleInRadians = ((90 - angleInDegrees) % 360) * (Math.PI / 180);

    const startX = startCoords[0];
    const startY = startCoords[1];

    const mapWidth = map.getSize()[0];
    const mapHeight = map.getSize()[1];

    // Berechne die Entfernung zum Kartenrand als Prozentsatz der kürzeren Abmessung der Karte
    const shortestDimension = Math.min(mapWidth, mapHeight);
    const distanceToEdgePercentage = 100;
    const distanceToEdge = shortestDimension * distanceToEdgePercentage;

    const endX = startX + distanceToEdge * Math.cos(angleInRadians);
    const endY = startY + distanceToEdge * Math.sin(angleInRadians);

    return [endX, endY];
  }

  rotateMapToCourse(map: Map, course: number): void {
    const correctedCourse = (0 - course) % 360;
    map.getView().setRotation(correctedCourse * (Math.PI / 180));
  }

  drawRingAroundPoint(coordinates: number[], radiusInMeters: number) {
    const circle = new Circle(coordinates, radiusInMeters);
    const ring = fromCircle(circle, 64); // 64 vertices for smoother ring

    const feature = new Feature({
      geometry: ring
    });

    const vectorSource = new VectorSource({
      features: [feature]
    });

    const vectorLayer = new Vector({
      source: vectorSource,
      style: new Style({
        stroke: new Stroke({
          color: 'rgb(255, 0, 0)',
          width: 0.5
        })
      })
    });

    return vectorLayer;
  }

  drawMarker(coordinates: number[], route = false) {

    const circle = new Circle(fromLonLat(coordinates), route ? 8 : 16);
    const ring = fromCircle(circle, 64); // 64 vertices for smoother ring

    const feature = new Feature({
      geometry: ring
    });

    const vectorSource = new VectorSource({
      features: [feature]
    });

    let vectorLayer;
    if (route) {
      vectorLayer = new Vector({
        source: vectorSource,
        style: new Style({
          fill: new Fill({
            color: '#1a9aff'
          })
        })
      });
    } else {
      vectorLayer = new Vector({
        source: vectorSource,
        style: new Style({
          fill: new Fill({
            color: '#ff2828'
          })
        })
      });
    }

    this.map.addLayer(vectorLayer);

    return vectorLayer;
  }

  drawTrackWaypoints(coordinates: number[], setVisible: boolean, record: TrackRecord) {

    const circle = new Circle(fromLonLat(coordinates), 4);
    const ring = fromCircle(circle, 64); // 64 vertices for smoother ring

    const feature = new Feature({
      geometry: ring
    });

    feature.set('record', record);

    this.trackWaypointFeatures.push(feature);

    const vectorSource = new VectorSource({
      features: [feature]
    });

    const vectorLayer = new Vector({
      source: vectorSource,
      visible: setVisible,
      zIndex: 999,
      style: new Style({
        fill: new Fill({
          color: '#c000ff'
        })
      })
    });

    this.map.addLayer(vectorLayer);

    return vectorLayer;
  }

  zoom(scale: number): void {
    this.map.getView().setZoom(this.map.getView().getZoom() + scale);
    localStorage.setItem(LocalStorageKey.ZoomScale, this.map.getView().getZoom().toString());
  }

  listenOnMapSelection(): void {

    if (this.trackView) {
      this.map.getView().on('change:resolution', () => {
        const currentZoom = this.map.getView().getZoom();
        if (currentZoom < 15 && this.trackDirectionSymbolsVisible) {
          this.trackDirectionSymbols.forEach(x => x.setVisible(false));
          this.trackWaypoints.forEach(x => x.setVisible(false));
          this.waypointsLayer.setVisible(false);
          this.trackDirectionSymbolsVisible = false;
        } else if (currentZoom >= 15 && !this.trackDirectionSymbolsVisible) {
          this.trackDirectionSymbols.forEach(x => x.setVisible(true));
          this.trackWaypoints.forEach(x => x.setVisible(true));
          this.waypointsLayer.setVisible(true);
          this.trackDirectionSymbolsVisible = true;
        }
      });
    }

    this.map.on('click', async (event) => {

      if (this.inArchiveMode) {

        const clickedCoordinate = event.coordinate;
        const feature = this.map.forEachFeatureAtPixel(event.pixel, f => {
          return f;
        });

        const trackWaypointFeature = this.trackWaypointFeatures.find(x => x === feature);
        if (trackWaypointFeature != null) {
          const record = trackWaypointFeature.get('record');
          this._waypointSelected.emit(record);
        }

      } else {

        if (this.routeEditing) {

          // Route Creation

          const clickedCoordinate = event.coordinate;
          const clickedLonLat = toLonLat(clickedCoordinate);
          const [clickedLon, clickedLat] = clickedLonLat;

          const point = this.drawMarker([clickedLon, clickedLat], true);
          this.markedWaypointLayers.push(point);
          this.selectedWaypointCoordinates.push(new Coordinate(clickedLon, clickedLat));

          const index = this.markedWaypointLayers.indexOf(point);

          if (index > 0) {
            const prevPosition = this.selectedWaypointCoordinates[index - 1];
            const line = this.drawMarkerLine([clickedLon, clickedLat], [prevPosition.longitude, prevPosition.latitude], true);
            this.markedWaypointLineLayers.push(line);
          }

        } else {

          // Select Waypoint with Course and Distance

          if (this.selectedWaypoint != null) {
            this.map.removeLayer(this.selectedWaypoint);
          }

          if (this.selectedWaypointLine != null) {
            this.map.removeLayer(this.selectedWaypointLine);
          }

          if (this.selectedWaypointPopup == null) {
            this.selectedWaypointPopupElement = document.getElementById('waypoint-popUp');
            this.selectedWaypointPopup = new Overlay({
              element: this.selectedWaypointPopupElement,
              positioning: 'top-left',
              stopEvent: false,
            });
            this.map.addOverlay(this.selectedWaypointPopup);
          }

          if (this.selectedWaypoint != null || this.selectedWaypointLine != null) {
            this.selectedWaypoint = null;
            this.selectedWaypointLine = null;
            this.clickedCoordinate = null;
            $('#waypoint-popUp').fadeOut();
            return;
          }

          this.clickedCoordinate = event.coordinate;
          this.setMarkerPopUp();

        }

      }

    });

  }

  setMarkerPopUp(): void {

    if (this.clickedCoordinate == null) {
      return;
    }

    const clickedLonLat = toLonLat(this.clickedCoordinate);
    const [clickedLon, clickedLat] = clickedLonLat;

    this.selectedWaypoint = this.drawMarker([clickedLon, clickedLat]);
    this.selectedWaypointLine = this.drawMarkerLine([this.decimalLon, this.decimalLat], [clickedLon, clickedLat]);

    const currentPos = new Coordinate(this.decimalLon, this.decimalLat);
    const selectedPos = new Coordinate(clickedLon, clickedLat);

    const distance = this.converter.round(this.converter.calculateDistance([currentPos, selectedPos], DistanceUnit.Miles), 1);
    const angle = this.converter.round(this.converter.calculateAngle(this.decimalLat, this.decimalLon, clickedLat, clickedLon), 0);

    this.selectedWaypointPopupElement.innerHTML = `${distance}nm<br>${angle}°`;
    this.selectedWaypointPopup.setPosition(this.clickedCoordinate);

    $('#waypoint-popUp').fadeIn();
  }

  undoWaypoint(): void {
    if (this.markedWaypointLayers.length > 0) {
      const lastWaypoint = this.markedWaypointLayers[this.markedWaypointLayers.length - 1];
      this.map.removeLayer(lastWaypoint);
      this.markedWaypointLayers.splice(this.markedWaypointLayers.length - 1, 1);
    }
    if (this.markedWaypointLineLayers.length > 0) {
      const lastWaypoint = this.markedWaypointLineLayers[this.markedWaypointLineLayers.length - 1];
      this.map.removeLayer(lastWaypoint);
      this.markedWaypointLineLayers.splice(this.markedWaypointLineLayers.length - 1, 1);
    }
    this.selectedWaypointCoordinates.splice(this.selectedWaypointCoordinates.length - 1, 1);
  }

  deleteWaypoints(): void {
    this.markedWaypointLayers.forEach(x => this.map.removeLayer(x));
    this.markedWaypointLineLayers.forEach(x => this.map.removeLayer(x));
    this.markedWaypointLayers = [];
    this.markedWaypointLineLayers = [];
    this.selectedWaypointCoordinates = [];
    this.routeEditing = false;
  }

  drawLine(startPosition: [number, number], endPosition: [number, number]): Layer {

    if (startPosition[0] === 0 || startPosition[1] === 0 || endPosition[0] === 0 || endPosition[1] === 0) {
      return;
    }

    const startPoint = fromLonLat(startPosition);
    const endPoint = fromLonLat(endPosition);

    const lineFeature = new LineString([startPoint, endPoint]);
    const lineLayer = new Vector({
      source: new VectorSource({
        features: [new Feature(lineFeature)],
      }),
      style: new Style({
        stroke: new Stroke({
          color: '#c000ff',
          width: 3,
        }),
      }),
    });

    this.map.addLayer(lineLayer);

    return lineLayer;
  }

  drawMarkerLine(startPosition: [number, number], endPosition: [number, number], route = false): Layer {

    if (startPosition[0] === 0 || startPosition[1] === 0 || endPosition[0] === 0 || endPosition[1] === 0) {
      return;
    }

    const startPoint = fromLonLat(startPosition);
    const endPoint = fromLonLat(endPosition);

    const lineFeature = new LineString([startPoint, endPoint]);

    let lineLayer;
    if (route) {
      lineLayer = new Vector({
        source: new VectorSource({
          features: [new Feature(lineFeature)],
        }),
        style: new Style({
          stroke: new Stroke({
            color: '#1477c5',
            width: 3,
          }),
        }),
      });
    } else {
      lineLayer = new Vector({
        source: new VectorSource({
          features: [new Feature(lineFeature)],
        }),
        style: new Style({
          stroke: new Stroke({
            color: '#ff2828',
            width: 2,
            lineDash: [6, 6],
          }),
        }),
      });
    }

    this.map.addLayer(lineLayer);

    return lineLayer;
  }

  async selectTrack(track: Track, center = false): Promise<void> {
    this.trackView = true;

    this.loader.startLoading();

    this.inArchiveMode = true;

    if (this.wsEmitter != null) {
      this.wsEmitter.close();
      this.wsEmitter = null;
    }

    this.map.removeLayer(this.positionLayer);
    this.map.removeLayer(this.distanceRing1);
    this.map.removeLayer(this.distanceRing2);
    this.map.removeLayer(this.directionLine);

    this.trackLines.forEach(x => this.map.removeLayer(x));
    this.trackLines = [];

    let trackDetails: Track;
    if (track.records == null || track.records.length === 0) {
      trackDetails = await this.trackSDK.getTrack(track.id);
    } else {
      trackDetails = track;
    }

    this.activeTrack = track;

    if (this.extract.trackDataKeys.length === 0) {
      await this.extract.init();
    }

    const cords: Coordinate[] = [];

    let directionSymbols = 0;
    const zoomScale = this.map.getView().getZoom();
    trackDetails.records.forEach((record) => {
      const curIndex = trackDetails.records.indexOf(record);
      if (curIndex > 0) {
        const prev = trackDetails.records[curIndex - 1];

        const curLat = this.extract.getLatitude(record.data);
        const curLon = this.extract.getLongitude(record.data);
        const curCourse = this.unit.convert(this.extract.getCourse(record.data), 'rad').value;

        const prevLat = this.extract.getLatitude(prev.data);
        const prevLon = this.extract.getLongitude(prev.data);

        cords.push(new Coordinate(curLon, curLat));
        this.trackLines.push(this.drawLine([curLon, curLat], [prevLon, prevLat]));

        this.trackWaypoints.push(this.drawTrackWaypoints([curLon, curLat], zoomScale >= 15, record));

        if (directionSymbols >= 5) {
          this.mapDrawDirectionSymbol(curLat, curLon, curCourse, zoomScale >= 15);
          directionSymbols = 0;
        } else {
          directionSymbols++;
        }
      }

    });

    if (center) {
      const convertedCoordinates = cords.map(cord => fromLonLat([cord.longitude, cord.latitude]));

      const vectorSource = new VectorSource();
      convertedCoordinates.forEach(cord => {
        vectorSource.addFeature(new Feature(new Point(cord)));
      });

      this.waypointsLayer = new VectorLayer({
        source: vectorSource,
        visible: zoomScale >= 15,
        style: new Style()
      });

      this.map.addLayer(this.waypointsLayer);
      this.map.getView().fit(vectorSource.getExtent(), {
        padding: [32, 32, 32, 32],
      });
    }

    this.setDistance();
    this.setDuration();

    this.loader.stopLoading();
  }

  async selectCoords(coords: number[][]): Promise<void> {
    this.trackView = false;

    this.loader.startLoading();

    this.inArchiveMode = true;

    if (this.wsEmitter != null) {
      this.wsEmitter.close();
      this.wsEmitter = null;
    }

    this.map.removeLayer(this.positionLayer);
    this.map.removeLayer(this.distanceRing1);
    this.map.removeLayer(this.distanceRing2);
    this.map.removeLayer(this.directionLine);

    this.trackLines.forEach(x => this.map.removeLayer(x));
    this.trackLines = [];

    let i = 0;
    coords.forEach(x => {
      const curIndex = coords.indexOf(x);
      if (curIndex > 0) {
        const prev = coords[curIndex - 1];

        if (i <= 8) {
          i++;
        } else {
          this.trackLines.push(this.drawLine([x[1], x[0]], [prev[1], prev[0]]));
          i++;
        }

      }
    });

    this.distance = -1;
    this.duration = null;

    this.setDistanceByCoords(coords);

    this.loader.stopLoading();

  }

  setDistance(track: Track = null): void {
    if (this.activeTrack != null || track != null) {

      const currentTrack = track == null ? this.activeTrack : track;

      const coords: Coordinate[] = [];
      this.distance = 0;
      currentTrack.records.forEach(x => {
        const lon = this.extract.getLongitude(x.data);
        const lat = this.extract.getLatitude(x.data);
        coords.push(new Coordinate(lon, lat));
      });

      this.distance = this.converter.round(this.converter.calculateDistance(
        coords, this.distanceUnit
      ), 1);
    }
  }

  setDistanceByCoords(coordsParam: number[][]): void {
    const coords: Coordinate[] = [];
    this.distance = 0;
    coordsParam.forEach(x => {
      const lon = x[0];
      const lat = x[1];
      coords.push(new Coordinate(lon, lat));
    });

    this.distance = this.converter.round(this.converter.calculateDistance(
      coords, this.distanceUnit
    ), 1);
  }

  setDuration(): void {
    if (this.activeTrack != null) {
      // tslint:disable-next-line:new-parens max-line-length
      const duration = this.dateTimeService.getDifferenceInMinutes(new Date(this.activeTrack.createdAt), this.activeTrack.stopAt == null ? new Date : new Date(this.activeTrack.stopAt));
      this.duration = this.dateTimeService.minutesToHoursAndMinutes(duration);
    }
  }

  async loadCurrentTrack(retry = true): Promise<void> {

    if (this.loadingTrack) {
      return;
    }

    this.loadingTrack = true;

    if (this.activeTrack == null) {
      const tracks = await this.trackSDK.getTracks();
      const activeTrack = tracks.find(x => x.stopAt == null);

      if (activeTrack == null) {
        this.loadingTrack = false;
        return;
      }

      this.activeTrack = await this.trackSDK.getTrack(activeTrack.id);
    }

    this.trackLines.forEach(x => {
      this.map.removeLayer(x);
    });

    this.trackLines = [];

    this.loadingTrack = false;

    this.extract.init().then(() => {
      this.activeTrack.records.forEach((record) => {
        const curIndex = this.activeTrack.records.indexOf(record);
        if (curIndex > 0) {
          const prev = this.activeTrack.records[curIndex - 1];

          const curLat = this.extract.getLatitude(record.data);
          const curLon = this.extract.getLongitude(record.data);

          const prevLat = this.extract.getLatitude(prev.data);
          const prevLon = this.extract.getLongitude(prev.data);

          this.trackLines.push(this.drawLine([curLon, curLat], [prevLon, prevLat]));
        }
      });

      this.setDistance();
      this.setDuration();

      if (this.wsEmitter == null || !this.wsEmitter.active) {
        this.wsEmitter = this.websocket.client.on(SocketChannel.TrackDetailManagedObject.toString(), async (recordId: number) => {

          if (this.activeTrack == null && retry) {
            await this.loadCurrentTrack(false);
          }

          const record = await this.trackSDK.getRecord(recordId);

          if (record == null) {
            return;
          }

          const prev = this.activeTrack.records[this.activeTrack.records.length - 1];

          const curLat = this.extract.getLatitude(record.data);
          const curLon = this.extract.getLongitude(record.data);

          const prevLat = this.extract.getLatitude(prev.data);
          const prevLon = this.extract.getLongitude(prev.data);

          this.trackLines.push(this.drawLine([curLon, curLat], [prevLon, prevLat]));
          this.activeTrack.records.push(record);

          this.setDistance();
          this.setDuration();
        });
      }

    });

  }

}

export enum MapRotationType {
  NorthOriented,
  VehicleOriented,
  NorthOrientedWithVehicleDirection
}

export enum DataWidget {
  WindGauge,
  MotorInfo,
  ShipInfo,
  WindInfo
}
