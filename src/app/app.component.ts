import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HandleWebRtcService } from './services/handle-web-rtc.service';
import { Observable, map } from 'rxjs';
import { HandleSocketService } from './services/handle-socket.service';

export interface RemoteUser {
  id?: string;
  name?: string;
  screen?: MediaStream;
  camera?: MediaStream;
  audio?: MediaStream
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit{
  title = 'angular-webRTC-test';
  localStream!: MediaStream;
  remoteUsers: RemoteUser[] = [];
  remoteUsersEmitter!: Observable<RemoteUser[]>;

  constructor(
    private _cdr: ChangeDetectorRef,
    private _sock: HandleSocketService,
    private handleWebRtcService: HandleWebRtcService,
  ) { }
  ngAfterViewInit(): void {
    navigator.mediaDevices.getUserMedia({ video: true }).then( stream => {
      this.localStream = stream;
      this._cdr.detectChanges();
    })
  }
  ngOnInit(): void {
    this._sock.listenOffer().subscribe( offer => {
      this.handleWebRtcService.setUpCalleePeer(offer, {video: this.localStream})
      .then( answer => {
        this._sock.sendAnswer(answer, offer.from);
      })
    })

    this._sock.listenAnswer().subscribe( answer => {
      this.handleWebRtcService.setCalleeAnswer(answer.answer).then(() => {
        console.log("Anwser setted")
      })
    })

    this.remoteUsersEmitter = this.handleWebRtcService.getRemoteStreams().pipe(
      map( remoteUser => {
        this._cdr.detectChanges();
        this.remoteUsers = [...this.remoteUsers, remoteUser]
        return this.remoteUsers
      })
    );
  }

  createCallerPeer(contact: string) {
    this.getLocalStream().then( stream => {
      return this.handleWebRtcService.setUpCallerPeer({video: stream})
    })
    .then( offer => {
      this._sock.sendOffer(offer, contact);
    }).catch((error) => {
      console.log(error);
    });
  }

  callAllPeers(){
    this.getLocalStream().then( stream => {
      return this.handleWebRtcService.setUpCallerPeer({video: stream})
    })
    .then( offer => {
      this._sock.callAllPeers(offer)
    }).catch((error) => {
      console.log(error);
    });
  }

  getLocalStream(): Promise<MediaStream> {
    return new Promise((resolve, reject) => {
      if (this.localStream) {
        resolve(this.localStream);
      } else {
        navigator.mediaDevices.getUserMedia({ video: true }).then( stream => {
          this.localStream = stream;
          resolve(stream);
        }).catch( error => {
          reject(error);
        })
      }
    })
  }
}
