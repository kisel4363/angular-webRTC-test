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

  ngOnInit(): void {
    
  }

  getMediaStream(user: string){
    if( user === "C1"){
      navigator.mediaDevices.getUserMedia({video: true})
      .then( stream => {
        this.localStream = stream;
        // create peer
        this.localPeer = new RTCPeerConnection({ iceServers });
        // Listen remote streams
        this.localPeer.ontrack = event => {
          console.log("RECEIVING STREAM", event.streams[0])
          this.remoteStream = event.streams[0];
          this.remoteStream.getTracks().forEach( tr => console.log("tr", tr) )
          document.getElementById
        }
        // save stream
        this.localStream = stream;
        // add stream to peer
        stream.getTracks().forEach( tr => {
          this.localPeer.addTrack(tr, stream);
        });
        // listen ice candidates
        this.localPeer.onicecandidate = ev => {
          console.log("Send cand")
          this._socket.sendIceCandidate(ev.candidate, "C2")
        }
        // listen ans
        this._socket.listenAnswer().subscribe( ({answer, from}) => {
          this.localPeer.setRemoteDescription(answer);
        })
      })
    } else if ( user === "C2"){
      navigator.mediaDevices.getDisplayMedia({video: true})
      .then( stream => {
        // create stream
        this.localPeer = new RTCPeerConnection({ iceServers });
        // listen remote stream
        this.localPeer.ontrack = event => {
          console.log("RECEIVING STREAM", event.streams[0])
          this.remoteStream = event.streams[0];
          this.remoteStream.getTracks().forEach( tr => console.log("tr", tr) )
        }
        // save stream
        this.localStream = stream;
        // add stream to peer
        // stream.getTracks().forEach( tr => {
        //   this.localPeer.addTrack(tr, stream);
        // });
        // add empty stream
        // const canvas = document.createElement('canvas');
        // const empty = canvas.captureStream();
        // empty.getTracks().forEach( tr => {
        //   tr.enabled = false;
        //   this.localPeer.addTrack(tr, empty);
        // });
        this._socket.listenIceCandidate().subscribe( ({ice, from}) => {
          console.log("Receive cand")
          this.localPeer.addIceCandidate(ice)
        })
        // set up answering peer
        this._socket.listenOffer().subscribe(({offer, from}) => {
          console.log("Receive offer")
          this.localPeer.setRemoteDescription(offer);
          
          this.localPeer.createAnswer().then( ans => {
            this.localPeer.setLocalDescription(ans);
            this._socket.sendAnswer(ans, "C1");
          })
        })
      })
    }
  }

  setUpTwoWayPeer(peer: RTCPeerConnection){
    // send candidate
    // listen ice candidates
    this.localPeer.onicecandidate = ev => {
      console.log("Send cand")
      this._socket.sendIceCandidate(ev.candidate, "C2")
    }
    // listen candidate
    this._socket.listenIceCandidate().subscribe( ({ice, from}) => {
      console.log("Receive cand")
      this.localPeer.addIceCandidate(ice)
    })

    // listen offer
    this._socket.listenOffer().subscribe(({offer, from}) => {
      console.log("Receive offer")
      this.localPeer.setRemoteDescription(offer);
      
      this.localPeer.createAnswer().then( ans => {
        this.localPeer.setLocalDescription(ans);
        this._socket.sendAnswer(ans, "C1");
      })
    })

    // listen ans
    this._socket.listenAnswer().subscribe( ({answer, from}) => {
      this.localPeer.setRemoteDescription(answer);
    })

  }

  sendOffer(peer: RTCPeerConnection, user: string, sendOnly = false){
    const options: RTCOfferOptions = {
      offerToReceiveAudio: false,
      offerToReceiveVideo: sendOnly
    }

    peer.createOffer(options)
    .then( offer => {
      peer.setLocalDescription(offer);
      this._socket.sendOffer(offer, user);
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
  }

  sendC2Stream(){
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
  }

}
