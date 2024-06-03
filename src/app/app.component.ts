import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HandleWebRtcService } from './services/handle-web-rtc.service';
import { Observable, map } from 'rxjs';
import { HandleSocketService } from './services/handle-socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit{
  title = 'angular-webRTC-test';

  constructor(
    private _sock: HandleSocketService,
    private handleWebRtcService: HandleWebRtcService,
    private _cdr: ChangeDetectorRef
  ) { }
  ngAfterViewInit(): void {
    navigator.mediaDevices.getUserMedia({ video: true }).then( stream => {
      this.localStream = stream;
      this._cdr.detectChanges();
    })
  }
  ngOnInit(): void {

    this._sock.listenOffert().subscribe( data => {
      this.handleWebRtcService.setUpCalleePeer(data, {video: this.localStream})
      .then( answer => {
        this._sock.sendAnswer(answer);
      })
    })

    this._sock.listenAnswer().subscribe( data => {
      this.handleWebRtcService.setCalleeAnswer(data);
    })

    this.remoteStreams = this.handleWebRtcService.getRemoteStreams().pipe( map( arr => { console.log("Update remote streams"); this._cdr.detectChanges(); return arr}));
  }

  localStream!: MediaStream;
  remoteStreams!: Observable<MediaStream[]>;

  createCallerPeer() {
    navigator.mediaDevices.getUserMedia({ video: true }).then( stream => {
      this.localStream = stream;
      this._cdr.detectChanges();
      return this.handleWebRtcService.setUpCallerPeer({video: stream})
    })
    .then( offer => {
      this._sock.sendOffer(offer);
    }).catch((error) => {
      console.log(error);
    });
    
  }

  createCalleePeer( ev: Event) {
    const offer = (ev.target as HTMLInputElement).value;
    // Get media stream
    navigator.mediaDevices.getUserMedia({ video: true }).then( stream => {
      this.localStream = stream;
      return this.handleWebRtcService.setUpCalleePeer(offer, { video: stream })
    })
    .then( answer => {
      this._sock.sendAnswer(answer);
    })
  }

  readCalleeAnswer(ev: Event) {
    const answer = (ev.target as HTMLInputElement).value;
    this.handleWebRtcService.setCalleeAnswer(answer).then(() => {
      console.log("setCalleeAnswer")
    });
  }
}
