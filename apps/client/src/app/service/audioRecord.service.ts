import RecordRTC from "recordrtc";
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {SocketService} from './socket.service';
import {HttpService} from '../client-sdk/services/http.service';
import {CustomRecordService} from '../client-sdk/services/customRecord.service';
import {SocketChannel} from '../client-sdk/resources/SocketChannel';
import {AlertsService, AlertState} from './alerts.service';
import {Observable, Subject} from "rxjs";
import moment from "moment";

@Injectable()
export class AudioRecordService {

  private stream;
  private recorder;
  private interval;
  private startTime;
  private _recorded = new Subject<RecordedAudioOutput>();
  private _recordingTime = new Subject<string>();
  private _recordingFailed = new Subject<string>();

  microphoneActive = false;
  audioErrorThrown = false;

  // audioOutput: Blob = null;

  constructor(private http: HttpClient,
              private httpService: HttpService,
              private websocket: SocketService,
              private customRecordService: CustomRecordService,
              private alertService: AlertsService) {
    //
  }

  getRecordedBlob(): Observable<RecordedAudioOutput> {
    return this._recorded.asObservable();
  }

  getRecordedTime(): Observable<string> {
    return this._recordingTime.asObservable();
  }

  recordingFailed(): Observable<string> {
    return this._recordingFailed.asObservable();
  }

  startRecording() {
    if (this.recorder) {
      // It means recording is already started or it is already recording something
      return;
    }

    this._recordingTime.next("00:00");
    navigator.mediaDevices
      .getUserMedia({audio: true})
      .then(s => {
        this.stream = s;
        this.record();
      })
      .catch(error => {
        this._recordingFailed.next('');
      });
  }

  abortRecording() {
    this.stopMedia();
  }

  private record() {
    this.recorder = new RecordRTC.StereoAudioRecorder(this.stream, {
      type: "audio",
      mimeType: "audio/webm"
    });

    this.recorder.record();
    this.startTime = moment();
    this.interval = setInterval(() => {
      const currentTime = moment();
      const diffTime = moment.duration(currentTime.diff(this.startTime));
      const time =
        this.toString(diffTime.minutes()) +
        ":" +
        this.toString(diffTime.seconds());
      this._recordingTime.next(time);
    }, 1000);
  }

  private toString(value) {
    let val = value;
    if (!value) val = "00";
    if (value < 10) val = "0" + value;
    return val;
  }

  stopRecording() {
    if (this.recorder) {
      this.recorder.stop(
        blob => {
          if (this.startTime) {
            const mp3Name = encodeURIComponent(
              "audio_" + new Date().getTime() + ".mp3"
            );
            this.stopMedia();
            this._recorded.next({blob: blob, title: mp3Name});
          }
        },
        () => {
          this.stopMedia();
          this._recordingFailed.next('');
        }
      );
    }
  }

  private stopMedia() {
    if (this.recorder) {
      this.recorder = null;
      clearInterval(this.interval);
      this.startTime = null;
      if (this.stream) {
        this.stream.getAudioTracks().forEach(track => track.stop());
        this.stream = null;
        this.send();
      }
    }
  }

  send(): void {
    this.customRecordService.setVisibility(false);

    this.getRecordedBlob().subscribe(record => {
      const formData = new FormData();
      formData.append('file', record.blob);

      this.http
        .post(this.httpService.api + '/api/vdr/record', formData, this.httpService.options)
        .subscribe(
          next => {
            this.alertService.alert(AlertState.Success, 'Die Übertragung der Datei war erfolgreich!');
          },
          error => {
            this.alertService.alert(AlertState.Error, 'Die Übertragung der Datei ist fehlgeschlagen!');
          });
    });
  }

  listenWebSocket(): void {
    this.websocket.client.on(SocketChannel.WhisperServiceResultObject.toString(), (result: IWhisperResult) => {
      this.alertService.alert(AlertState.Success, `Es wurde ein neuer Logbuch-Eintrag empfangen! (${result.message})`, 10000);
    });
  }

}

interface IWhisperResult {
  state: string;
  message: string;
}

interface RecordedAudioOutput {
  blob: Blob;
  title: string;
}

