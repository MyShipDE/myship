import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ComponentTemplate} from '../../../../service/ComponentTemplate';
import {VoiceCenterService} from '../../../../service/voiceCenter.service';
import {PreviewRouteService} from '../../../../service/previewRoute.service';
import {SocketService} from '../../../../service/socket.service';
import {ConvertingService} from '../../../../service/converting.service';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort, Sort} from '@angular/material/sort';
import {LiveAnnouncer} from '@angular/cdk/a11y';
import {DatetimeService} from '../../../../service/datetime.service';
import {Track} from '../../../../client-sdk/models/Track';
import {CustomRecordService} from '../../../../client-sdk/services/customRecord.service';
import {VdrService} from '../../../../client-sdk/services/vdr.service';
import {LoaderService} from '../../../../service/loader.service';
import {TrackService} from '../../../../client-sdk/services/track.service';
import {DatePickerFilterService} from './filters/DatePickerFilterComponent/DatePickerFilter.service';
import {DateHelper} from '../../../../service/DateHelper';
import {AlertsService, AlertState} from '../../../../service/alerts.service';
import {VoiceEntry} from "../../../../client-sdk/models/VoiceEntry";

@Component({
  selector: 'app-logbook-archive',
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.scss']
})

export class ArchiveLogbookComponent extends ComponentTemplate implements OnInit {

  @Input() isEmbedded = false;
  @Output() selectedTrackEvent: EventEmitter<Track> = new EventEmitter<Track>();

  loader = false;

  filterOptions: FilterOption[];
  tableHeading: TableHeader[];
  tableHeadingVoiceEntries: TableHeader[];
  tracks: TrackView[];
  selectedTrack: Track;
  selectedFilter: FilterOption;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('results') resultElement: ElementRef;
  displayedColumns: string[] = ['name', 'date', 'start', 'stop', 'duration'];
  dataSource: MatTableDataSource<TrackView>;

  @ViewChild('resultsVoiceEntries') resultElementVoiceEntries: ElementRef;
  displayedColumnsVoiceEntries: string[] = ['message', 'date', 'time'];
  dataSourceVoiceEntries: MatTableDataSource<VoiceEntry>;

  filter = true;
  resultsArchive = false;
  resultsVoiceEntries = false;


  tracksOverlay = false;
  days: Date[] = [];
  startDate: string = null;
  endDate: string = null;
  coords: number[][] = [];

  page = 0;
  pages = 0;

  constructor(public voiceCenterService: VoiceCenterService,
              public customRecordService: CustomRecordService,
              public vdrService: VdrService,
              private trackService: TrackService,
              private websocket: SocketService,
              public convert: ConvertingService,
              public previewService: PreviewRouteService,
              private liveAnnouncer: LiveAnnouncer,
              public datetimeService: DatetimeService,
              private loaderService: LoaderService,
              private datePicker: DatePickerFilterService,
              private alertService: AlertsService) {
    super();
  }

  async ngOnInit(): Promise<void> {

    if (screen.width > 700) {
      this.resultsArchive = true;
    }

    this.filterOptions = [];
    this.filterOptions.push(new FilterOption(FilterOptionName.All, false));
    this.filterOptions.push(new FilterOption(FilterOptionName.Date, false));
    // this.filterOptions.push(new FilterOption(FilterOptionName.Duration, false));
    // this.filterOptions.push(new FilterOption(FilterOptionName.Countries, false));
    // this.filterOptions.push(new FilterOption(FilterOptionName.Cities, false));
    // this.filterOptions.push(new FilterOption(FilterOptionName.BoatsName, false));
    // this.filterOptions.push(new FilterOption(FilterOptionName.Trip, false));
    // this.filterOptions.push(new FilterOption(FilterOptionName.Race, false));
    // this.filterOptions.push(new FilterOption(FilterOptionName.BoatsType, false));
    // this.filterOptions.push(new FilterOption(FilterOptionName.Crew, false));
    this.filterOptions.push(new FilterOption(FilterOptionName.VoiceEntries, false));
    this.filterOptions.push(new FilterOption(FilterOptionName.Tracks, false));

    this.tableHeading = [];
    this.tableHeading.push(new TableHeader('Bezeichnung')); // ⌀
    this.tableHeading.push(new TableHeader('Datum'));
    this.tableHeading.push(new TableHeader('Start'));
    this.tableHeading.push(new TableHeader('Ankunft'));
    this.tableHeading.push(new TableHeader('Dauer'));

    this.tableHeadingVoiceEntries = [];
    this.tableHeadingVoiceEntries.push(new TableHeader('Nachricht'));
    this.tableHeadingVoiceEntries.push(new TableHeader('Datum'));
    this.tableHeadingVoiceEntries.push(new TableHeader('Uhrzeit'));

    this.listenWebSocket();
  }

  get IsFilterActive(): boolean {
    return this.filterOptions.find(x => x.state) != null;
  }

  async applyFilter(filterOption: FilterOption = null, scroll: boolean = false): Promise<void> {

    this.loader = true;

    this.resultsArchive = false;
    this.resultsVoiceEntries = false;
    this.dataSourceVoiceEntries = null;
    this.dataSource = null;

    if (filterOption != null) {
      this.selectedFilter = filterOption;
      this.filterOptions.map(x => x.state = false);
      this.selectedFilter.state = true;
    }

    let tracks: Track[];

    if (!scroll) {
      this.tracks = [];
    }

    if (this.selectedFilter.description === FilterOptionName.VoiceEntries) {

      this.resultsVoiceEntries = true;

      const entries = await this.vdrService.getVoiceEntries();

      this.dataSourceVoiceEntries = new MatTableDataSource<VoiceEntry>(entries);
      this.dataSourceVoiceEntries.sort = this.sort;

      this.loader = false;

      return;
    }

    if (this.selectedFilter.description === FilterOptionName.Tracks) {

      this.days = await this.trackService.getDates();
      this.tracksOverlay = true;

      this.loader = false;
      return;
    }

    this.resultsArchive = true;

    const divHeight = this.resultElement.nativeElement.offsetHeight;

    let rowSpace: number;
    if (divHeight < 200) {
      rowSpace = 16;
    } else {
      rowSpace = divHeight / 32 - 10;
    }

    switch (this.selectedFilter.description) {
      case FilterOptionName.All:
        if (scroll) {
          tracks = await this.vdrService.getTracksWithCustomOperation(10, this.tracks.length);
        } else {
          tracks = await this.vdrService.getTracksWithCustomOperation(+rowSpace.toFixed(0), 0);
        }
        // this.pages = await this.vdrService.getTracksCount();
        break;
      case FilterOptionName.Date:
        const selection = await this.datePicker.selectDate();

        if (selection == null) {
          this.loader = false;
          return;
        }

        tracks = await this.trackService.getTracksWithPaginationByDate(DateHelper.stringToDate(selection), this.page);
        // this.pages = await this.vdrService.getTracksCount();
        break;
    }

    tracks.forEach(track => {
      if (this.tracks.find(x => x.id === track.id) == null) {
        this.tracks.push(Object.assign(new TrackView(), track));
      }
    });

    this.tracks.forEach((track: TrackView) => {
      track.date = track.createdAt;
      track.start = track.createdAt;
      track.stop = track.stopAt;
      track.duration = Math.round(track.stopAt == null ? 0 : this.datetimeService.getDifferenceInMinutes(new Date(track.createdAt), new Date(track.stopAt)));
    });

    this.tracks = this.tracks.filter(x => x.stopAt != null);

    this.dataSource = new MatTableDataSource<TrackView>(this.tracks);
    this.dataSource.sort = this.sort;

    this.loader = false;
  }

  getPages(tracksCount: number): number {
    const pages = tracksCount / 10;
    const rest = tracksCount % 10;
    if (rest === 0) {
      return pages;
    } else {
      return +pages.toFixed(0) + 1;
    }
  }

  async announceSortChange(sortState: Sort): Promise<void> {
    if (sortState.direction) {
      await this.liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      await this.liveAnnouncer.announce('Sorting cleared');
    }
  }

  async selectTrack(track: Track): Promise<void> {
    if (this.isEmbedded) {
      this.selectedTrackEvent.emit(track);
    } else {
      this.coords = [];
      this.selectedTrack = track;
      this.previewService.setVisibility(true);
    }
  }

  async selectDateRange(): Promise<void> {
    if (this.startDate != null && this.endDate != null) {
      this.loader = true;

      this.selectedTrack = null;
      this.coords = await this.trackService.getCoordsByDateRange(this.startDate, this.endDate);
      this.startDate = null;
      this.endDate = null;

      this.previewService.setVisibility(true);
      this.tracksOverlay = false;

      this.loader = false;
    }
  }

  listenWebSocket(): void {
    /* this.websocket.client.on('track', (track: Track) => {
      this.tracks.find(x => x.id === track.id).name = track.name;
    }); */
  }

  protected readonly FilterOption = FilterOption;
  protected readonly FilterOptionName = FilterOptionName;
}

export class TrackView extends Track {

  date: Date;
  start: Date;
  stop: Date;
  duration: number;

  constructor() {
    super();
  }
}

export class FilterOption {
  constructor(public description: FilterOptionName, public state: boolean) {
    //
  }
}

export class TableHeader {
  constructor(public name: string) {
    //
  }
}

export enum FilterOptionName {
  All = 'Alle',
  Countries = 'Länder',
  Cities = 'Orte',
  Date = 'Datum',
  BoatsName = 'Schiffsname',
  Trip = 'Törn',
  Race = 'Regatta',
  BoatsType = 'Schiffstyp',
  Crew = 'Crew',
  Duration = 'Dauer',
  VoiceEntries = 'Spracheinträge',
  Tracks = 'Törns'
}
