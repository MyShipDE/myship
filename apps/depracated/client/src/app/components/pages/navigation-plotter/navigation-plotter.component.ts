import {AfterViewInit, Component, ElementRef, IterableDiffers, ViewChild} from '@angular/core';
import {NavigationPlotterService} from './navigation-plotter.service';
import {SignalKService} from '../../../service/SignalK.Service';
import {SignalkData} from '../../../client-sdk/models/SignalkData';
import {UnitService} from '../../../service/unit.service';
import {ConvertingService} from '../../../service/converting.service';
import {SignalKIdentifier} from '../../../client-sdk/classes/SignalKIdentifier';
import $ from 'jquery';
import {TrackService} from '../../../client-sdk/services/track.service';
import {ExtractDataService} from '../../../service/extractData.service';
import {SocketService} from '../../../service/socket.service';
import {DistanceUnit} from '../../../client-sdk/classes/DistanceUnit';
import {DatetimeService} from '../../../service/datetime.service';
import {VdrOverlayService} from './vdr-overlay/vdr-overlay.service';
import {LoaderService} from '../../../service/loader.service';
import {CustomRecordService} from '../../../client-sdk/services/customRecord.service';
import {MapRotationType, OpenLayerExtension, DataWidget} from '../../../extensions/OpenLayerExtension';
import {Control} from 'ol/control';

@Component({
  selector: 'app-navigation-plotter',
  templateUrl: './navigation-plotter.component.html',
  styleUrls: ['./navigation-plotter.component.scss']
})

export class NavigationPlotterComponent extends OpenLayerExtension implements AfterViewInit {

  // tslint:disable-next-line:typedef
  get MapRotationTypeClass() {
    return MapRotationType;
  }

  get isMoving(): boolean {
    return this.unit.convert(this.speedOverGround, 'm/s').value > 0.2;
  }

  constructor(public service: NavigationPlotterService,
              public converter: ConvertingService,
              public vdrOverlay: VdrOverlayService,
              public customRecord: CustomRecordService,
              protected loader: LoaderService,
              protected dateTimeService: DatetimeService,
              protected unit: UnitService,
              protected trackService: TrackService,
              protected extract: ExtractDataService,
              protected websocket: SocketService,
              private signalK: SignalKService, differs: IterableDiffers,
              private elementRef: ElementRef) {
    super(converter, loader, trackService, extract, unit, dateTimeService, websocket);
    this.iterableDiffer = differs.find([]).create(null);
  }

  @ViewChild('map') mapEl: ElementRef;

  private iterableDiffer: any;

  protected readonly DataWidget = DataWidget;
  protected readonly DistanceUnit = DistanceUnit;

  ngAfterViewInit(): void {
    this.viewInit = true;

    if (this.menuOpen) {
      $('#menu').slideDown();
    } else {
      $('#menu').slideUp();
    }

    $('#menu-button').on('click', () => {
      this.menuOpen = !this.menuOpen;
      $('#menu').slideToggle();
    });

    try {
      const layers = [
        this.layers.osm,
        this.layers.openSeaMap
      ];

      const controlsComponents = {
        archiveInfo: new Control({
          element: document.getElementById('archive-mode')
        }),
        menuControls: new Control({
          element: document.getElementById('custom-zoom-control')
        }),
        positionControl: new Control({
          element: document.getElementById('position-icon-control')
        }),
        sogControl: new Control({
          element: document.getElementById('sog-control')
        }),
        windGaugeControl: new Control({
          element: document.getElementById('wind-gauge-control')
        }),
        vdrInfoControl: new Control({
          element: document.getElementById('vdr-info')
        })
      };

      const controls = [
        controlsComponents.menuControls,
        controlsComponents.positionControl,
        controlsComponents.sogControl,
        controlsComponents.windGaugeControl,
        controlsComponents.vdrInfoControl
      ];

      this.createMap(this.decimalLat, this.decimalLon, layers, controls);
    } catch (e) {
      console.log(e);
    }

  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngDoCheck(): void {
    const changes = this.iterableDiffer.diff(this.signalK.dataList);
    if (changes) {
      this.signalK.dataList.forEach((element: SignalkData) => {
        switch (element.getDesc()) {
          case 'navigation.position':

            const lon = element.getValue().longitude;
            const lat = element.getValue().latitude;

            this.lon = element.formatCords()[0];
            this.lat = element.formatCords()[1];
            this.decimalLon = lon;
            this.decimalLat = lat;

            if (!this.inArchiveMode) {
              if (this.mapInit && this.map != null) {
                this.mapDrawPosition(lat, lon);
                if (this.fixedMap) {
                  this.updateMapView(lat, lon);
                }
              }

              if (this.selectedWaypoint != null) {
                this.map.removeLayer(this.selectedWaypoint);
                this.map.removeLayer(this.selectedWaypointLine);
                this.setMarkerPopUp();
              }
            }

            break;
          case 'navigation.courseOverGroundTrue':
            if (!this.service.demoMode && !this.inArchiveMode) {

              if (this.speedOverGround <= 0) {
                return;
              }

              this.course = this.unit.convert(element.getValue(), 'rad').value;
              this.courseInRad = element.getValue();

              if (this.mapInit && this.map != null && this.isMoving) {
                this.drawDirectionLine(this.decimalLat, this.decimalLon);
                if (this.northOriented) {
                  this.positionIcon.getImage().setRotation(this.courseInRad);
                } else {
                  this.rotateMapToCourse(this.map, this.course);
                }
              } else if (this.mapInit && this.map != null && this.mapRotationType === MapRotationType.VehicleOriented) {
                this.switchMapRotationType(MapRotationType.NorthOriented);
              }
            }
            break;
          case 'navigation.speedOverGround':
            if (!this.service.demoMode) {
              this.speedOverGround = element.getValue();
            }
            break;
          case SignalKIdentifier.navigationGnssSatellitesValue.toString():
            if (!this.service.demoMode) {
              this.satellite = element.getValue();
            }
            break;
          case 'navigation.datetime':
            if (!this.service.demoMode) {
              this.datetime = element.getValue();
            }
            break;
          case 'navigation.headingMagnetic':
            if (this.speedOverGround <= 0) {
              this.course = this.unit.convert(element.getValue(), 'rad').value;
              this.courseInRad = element.getValue();
            }
            break;
        }
      });
    }
  }

  getSpeed(): string[] {
    let speed = this.unit.convert(this.speedOverGround, 'm/s').value;

    if (this.distanceUnit === DistanceUnit.Kilometers) {
      speed = this.converter.ktsToKmh(speed);
    }

    const speedRound = this.converter.round(speed, 1);
    if (speedRound.toString().includes('.')) {
      const speedArr = speedRound.toString().split('.');
      return [speedArr[0], speedArr[1]];
    } else {
      return [speedRound.toString(), '0'];
    }
  }

  switchMapRotationType(mapRotationType: MapRotationType): void {
    if (mapRotationType === MapRotationType.NorthOriented) {
      this.map.getView().setRotation(0);
      this.mapRotationType = MapRotationType.NorthOriented;
      this.northOriented = true;
      this.fixedMap = true;
      if (!this.isMoving) {
        this.positionIcon.getImage().setRotation(0);
        this.map.removeLayer(this.directionLine);
      }
    } else if (mapRotationType === MapRotationType.VehicleOriented) {
      this.positionIcon.getImage().setRotation(0);
      this.mapRotationType = MapRotationType.VehicleOriented;
      this.northOriented = false;
      this.fixedMap = true;
    } else if (mapRotationType === MapRotationType.NorthOrientedWithVehicleDirection) {
      this.map.getView().setRotation(0);
      this.mapRotationType = MapRotationType.NorthOrientedWithVehicleDirection;
      this.northOriented = true;
      this.fixedMap = false;
    }
  }

  toggleDistanceUnit(): void {
    if (this.distanceUnit === DistanceUnit.Kilometers) {
      this.distanceUnit = DistanceUnit.Miles;
    } else {
      this.distanceUnit = DistanceUnit.Kilometers;
    }

    this.setDistance();
  }

  leaveArchiveMode(): void {
    this.trackLines.forEach(x => this.map.removeLayer(x));
    this.trackLines = [];
    this.trackDirectionSymbols.forEach(x => this.map.removeLayer(x));
    this.trackDirectionSymbols = [];
    this.inArchiveMode = false;
    this.activeTrack = null;
    this.distance = -1;
    this.duration = null;
    this.loadCurrentTrack().then();
  }

}
