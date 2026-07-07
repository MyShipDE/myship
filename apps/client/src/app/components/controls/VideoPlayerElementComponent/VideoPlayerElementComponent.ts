import {DomSanitizer} from '@angular/platform-browser';
import {AfterViewInit, Component, Input} from '@angular/core';

declare var window: any;

@Component({
  selector: 'app-video-player-element-component',
  templateUrl: './VideoPlayerElementComponent.html',
  styleUrls: [],
})
export class VideoPlayerElementComponent implements AfterViewInit {
  @Input() url;
  player;
  plyr;

  constructor(public sanitizer: DomSanitizer) {
  }

  ngAfterViewInit(): void {
    console.log('Init Video Player');
    const video: any = document.getElementById('videoElement');

    /* if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(this.url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play();
      });
    } */

    // Plyr.setup(video);
  }

  updateQuality(newQuality): void {
    window.hls.levels.forEach((level, levelIndex) => {
      if (level.height === newQuality) {
        window.hls.currentLevel = levelIndex;
      }
    });
  }
}
