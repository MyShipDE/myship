import {Component, OnInit} from '@angular/core';
import {NgAudioRecorderService, OutputFormat, RecorderState} from 'ng-audio-recorder';
import {VoiceCenterService} from '../../../../service/voiceCenter.service';
import {HttpService} from '../../../../client-sdk/services/http.service';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-vdr-voice',
  templateUrl: './VoiceCenter.Component.html',
  styleUrls: [
    './VoiceCenter.Component.scss'
  ]
})
export class VoiceCenterComponent implements OnInit {

  microphoneActive = false;
  recordCaptured = false;
  audioOutput: Blob = null;

  constructor(private audioRecorderService: NgAudioRecorderService,
              public service: VoiceCenterService,
              private http: HttpClient,
              private httpService: HttpService) {
    this.audioRecorderService.recorderError.subscribe(recorderErrorCase => {
      console.log('Catch Error, while Audio-Recording');
    });
  }

  async ngOnInit(): Promise<void> {
    this.service.load();
  }

  pressMicrophone(): void {
    if (this.microphoneActive) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  startRecording(): void {
    this.audioRecorderService.startRecording();
    this.microphoneActive = true;
  }

  stopRecording(): void {
    this.audioRecorderService.stopRecording(OutputFormat.WEBM_BLOB).then((output: Blob) => {
      this.microphoneActive = false;
      this.recordCaptured = true;
      this.audioOutput = output;
    }).catch(err => {
      // TODO Alert
    });
  }

  send(): void {
    this.recordCaptured = false;
    const formData = new FormData();
    formData.append('file', this.audioOutput);

    this.http
      .post(this.httpService.api + '/api/vdr/record', formData, this.httpService.options)
      .subscribe(
        next => {
          // TODO Alert
        },
        error => {
          // TODO Alert
        });
  }

  get RecorderState(): any {
    return RecorderState;
  }

  Dispose(): void {
    this.service.setVisibility(false);
  }

}
