import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Observable, Subject, map } from 'rxjs';
import { HandleSocketService } from './services/handle-socket.service';

export interface RemoteUser {
  id?: string;
  name?: string;
  screen?: MediaStream;
  camera?: MediaStream;
  audio?: MediaStream
}

export const iceServers: RTCIceServer[] = [
  {
      urls: "stun:stun.relay.metered.ca:80",
  },
  {
      urls: "turn:global.relay.metered.ca:80",
      username: "2e6860650790feec5673b39b",
      credential: "hNaTrO/JT/aGUe+v",
  },
  {
      urls: "turn:global.relay.metered.ca:80?transport=tcp",
      username: "2e6860650790feec5673b39b",
      credential: "hNaTrO/JT/aGUe+v",
  },
  {
      urls: "turn:global.relay.metered.ca:443",
      username: "2e6860650790feec5673b39b",
      credential: "hNaTrO/JT/aGUe+v",
  },
  {
      urls: "turns:global.relay.metered.ca:443?transport=tcp",
      username: "2e6860650790feec5673b39b",
      credential: "hNaTrO/JT/aGUe+v",
  }
]

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(){
    
  }
}
