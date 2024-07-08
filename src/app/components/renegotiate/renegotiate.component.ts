import { Component, OnInit } from '@angular/core';
import { iceServers } from 'src/app/app.component';
import { HandleRenegotiateService } from 'src/app/services/handle-renegotiate.service';
import { HandleSocketService } from 'src/app/services/handle-socket.service';

@Component({
  selector: 'app-renegotiate',
  templateUrl: './renegotiate.component.html',
  styleUrls: ['./renegotiate.component.scss']
})
export class RenegotiateComponent implements OnInit {
  user = { username: "" };
  remoteStream!: MediaStream;
  localPeer!: RTCPeerConnection;
  localStream!: MediaStream;

  constructor(
    private _socket: HandleSocketService,
    private _renegotiate: HandleRenegotiateService
  ) {
    _socket.listenConnection().subscribe( username => {
      this.user = { username };
      this.getMediaStream(username)
    })
  }

  ngOnInit(): void { }

  getMediaStream(user: string){
    if( user === "C1"){
      navigator.mediaDevices.getUserMedia({video: true})
      .then( stream => {
        // create peer
        this.localPeer = this.createPeer(stream);
        // save stream
        this.localStream = stream;
      })
    } else if ( user === "C2"){
      navigator.mediaDevices.getDisplayMedia({video: true})
      .then( stream => {
        // create peer
        this.localPeer = this.createPeer(stream);
        // save stream
        this.localStream = stream;
      })
    }
  }

  createPeer(stream?: MediaStream){
    // create peer
    const peer = new RTCPeerConnection({ iceServers });
    // Listen remote streams
    peer.ontrack = event => {
      console.log("Incoming stream", event.streams[0])
      this.remoteStream = event.streams[0];
    }
    if(stream){
      stream.getTracks().forEach( tr => {
        peer.addTrack(tr, stream);
      });
    }
    // set up peer to receive and send offers
    this.setUpTwoWayPeer(peer)

    return peer
  }
  setUpTwoWayPeer(peer: RTCPeerConnection){
    // listen candidate
    this._socket.listenIceCandidate().subscribe( ({ice, from}) => {
      console.log("Incoming Candidate")
      peer.addIceCandidate(ice)
    })

    // listen offer
    this._socket.listenOffer().subscribe(({offer, from}) => {
      console.log("Incoming offer")
      // Receiving offer with a previews connection
      if (peer.connectionState !== "new"){
        console.log("Connection not new")
        this.localPeer = this.createPeer(this.localStream);
      }

      peer.setRemoteDescription(offer)
      .then( () => peer.createAnswer() )
      .then( ans => 
        peer.setLocalDescription(ans)
        .then( () => this._socket.sendAnswer(ans, from) )
      )
    })

    // listen ans
    this._socket.listenAnswer().subscribe( ({answer, from}) => {
      console.log("Incoming answer", answer)
      this.localPeer.setRemoteDescription(answer);
    })

  }

  sendC1Stream(){
    // send offer
    const options: RTCOfferOptions = {
      offerToReceiveAudio: false,
      offerToReceiveVideo: false
    }
    this.localPeer.createOffer(options)
    .then( offer => {
      this.localPeer.setLocalDescription(offer);
      this._socket.sendOffer(offer, "C2");
    })
    // send ice
    this.localPeer.onicecandidate = ev => {
      console.log("Send cand")
      this._socket.sendIceCandidate(ev.candidate, "C2")
    }
  }

  sendC2Stream(){
    // send offer
    const options: RTCOfferOptions = {
      offerToReceiveAudio: false,
      offerToReceiveVideo: true
    }
    this.localPeer.createOffer()
    .then( offer => {
      this._socket.sendOffer(offer, "C1");
      this.localPeer.setLocalDescription(offer);
    })
    // send ice
    this.localPeer.onicecandidate = ev => {
      console.log("Send cand")
      this._socket.sendIceCandidate(ev.candidate, "C1")
    }
  }

}
