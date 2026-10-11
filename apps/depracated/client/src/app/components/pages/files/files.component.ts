import {Component, Input, OnInit} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import {HttpService} from '../../../client-sdk/services/http.service';

@Component({
  selector: 'app-instruments',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss']
})
export class FilesComponent implements OnInit {

  title = 'Dokumente';

  files: Array<any> = new Array<any>();
  dirs: Array<number> = [];

  // Create Dir
  dirName = '';
  dirModal = false;

  // Delete
  deleteMode = false;

  // Upload
  fileName = '';
  uploadModal = false;
  inputFiles: any[];

  // ShowFile
  fileModel = false;
  currentFileName = '';
  showPNG = false;
  showPDF = false;
  fileSRC = null;

  constructor(private sanitizer: DomSanitizer,
              private http: HttpClient,
              private httpService: HttpService) {
    //
  }

  ngOnInit(): void {
    this.loadFiles();
  }

  loadFiles(): void {
    this.title = 'Dokumente';
    this.dirs = [];

    this.http
      .get(this.httpService.api + '/files', this.httpService.options)
      .subscribe((res: any) => {
        this.files = new Array<any>();
        res.forEach((file: any) => {
          if (file.directory_id == null) {
            if (file.isDirectory && file.path == null) {
              this.files.push(file);
            } else if (!file.isDirectory && file.path != null) {
              const extArr = file.path.split('/');
              file.ext = extArr[extArr.length - 1];
              file.ext = file.ext.split('.')[1];
              this.files.push(file);
            }
          }
        });
      });
  }

  openDir(id: number, force = false): void {
    if (force) {
      this.dirs.push(id);
    }

    this.files.forEach((file: any) => {
      if (file.id === id) {
        this.title = file.name;
      }
    });

    this.http
      .get(this.httpService.api + '/files', this.httpService.options)
      .subscribe((res: any) => {
        this.files = new Array<any>();
        res.forEach((file: any) => {
          if (file.directory_id != null && file.directory_id === id) {
            if (file.isDirectory && file.path == null) {
              this.files.push(file);
            } else if (!file.isDirectory && file.path != null) {
              const extArr = file.path.split('/');
              file.ext = extArr[extArr.length - 1];
              file.ext = file.ext.split('.')[1];
              this.files.push(file);
            }
          }
        });
      });
  }

  createDir(): void {
    if (this.dirName !== '') {

      this.http
        .post(this.httpService.api + '/dir', {
          name: this.dirName,
          directory_id: this.dirs[this.dirs.length - 1]
        }, this.httpService.options)
        .subscribe(() => {
          if (this.dirs.length > 0) {
            this.openDir(this.dirs[this.dirs.length - 1]);
          } else {
            this.loadFiles();
          }
          this.dirName = '';
          this.dirModal = false;
        });
    }
  }

  goDirBack(): void {
    console.log(this.dirs);
    if (this.dirs.length > 1) {
      this.dirs.pop();
      console.log(this.dirs);
      this.openDir(this.dirs[this.dirs.length - 1]);
    } else {
      this.dirs = [];
      this.loadFiles();
    }
  }

  switchDeleteMode(): void {
    if (this.deleteMode) {
      this.deleteMode = false;
    } else {
      this.deleteMode = true;
    }
  }

  deleteItem(id: number): void {
    this.http
      .delete(this.httpService.api + '/file/' + id, this.httpService.options)
      .subscribe(() => {
        if (this.dirs.length > 0) {
          this.openDir(this.dirs[this.dirs.length - 1]);
        } else {
          this.loadFiles();
        }
        this.deleteMode = false;
      });
  }

  onFileChange(event): void {
    this.inputFiles = event.target.files;
    console.log(this.inputFiles);
  }

  uploadFile(): void {

    if (this.inputFiles.length > 0 && this.fileName !== '') {
      const file: File = this.inputFiles[0];
      const formData = new FormData();
      formData.append('file', file, file.name);
      formData.append('name', this.fileName);

      if (this.dirs.length > 0) {
        formData.append('directory_id', this.dirs[this.dirs.length - 1] + '');
      }

      this.http
        .post(this.httpService.api + '/file', formData, this.httpService.options)
        .subscribe(() => {
          if (this.dirs.length > 0) {
            this.openDir(this.dirs[this.dirs.length - 1]);
          } else {
            this.loadFiles();
          }
          this.uploadModal = false;
        });
    } else {
      // TODO Alert
    }
  }

  async showFile(file): Promise<void> {
    this.currentFileName = file.name;
    // const id = await Device.getId();
    this.fileModel = true;
    if (file.ext === 'png' || file.ext === 'jpg' || file.ext === 'jpeg') {

      /*const sdk = new Backend();
      sdk.get('file/' + file.id, []).then((res: HttpResponse) => {
        if (res.status === 200) {
          console.log(res.data);
          this.fileSRC = this.sanitizer.bypassSecurityTrustHtml(res.data);
        }
      });*/

      /* const path = 'http://' + localStorage.getItem('server') + '/file/' + file.id + '?auth=' + id.uuid;
      this.fileSRC = path;
      this.showPNG = true; */
    } else if (file.ext === 'pdf') {
      /* const path = 'http://' + localStorage.getItem('server') + '/file/' + file.id + '?auth=' + id.uuid;

      const tmpFile = new Blob([path]);
      this.fileSRC = URL.createObjectURL(file);

      this.showPDF = true;
      console.log(this.fileSRC); */
    }
  }

  closeAllFiles(): void {
    this.fileModel = false;
    this.showPNG = false;
  }

  goToLink(url: string): void {
    window.open(url, '_blank');
  }

}
