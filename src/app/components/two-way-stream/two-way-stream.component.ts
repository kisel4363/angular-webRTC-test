import { Component, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { iceServers } from 'src/app/app.component';
import { HandleSocketService } from 'src/app/services/handle-socket.service';

@Component({
  selector: 'app-two-way-stream',
  templateUrl: './two-way-stream.component.html',
  styleUrls: ['./two-way-stream.component.scss']
})
export class TwoWayStreamComponent implements OnInit {
  protected user = {username: ""};
  // Initialize variables
  localStream!: MediaStream;
  remoteStream!: MediaStream;
  localPeerConnection!: RTCPeerConnection;
  remotePeerConnection!: RTCPeerConnection;

  // Get references to HTML elements
  localVideo!: HTMLVideoElement;
  remoteVideo!: HTMLVideoElement;

  constructor(
    private _socket: HandleSocketService
  ) { }
  ngAfterViewInit(): void { }

  ngOnInit(): void {
    this._socket.listenConnection().subscribe( username => {
      this.user.username = username;
      console.warn("IM USER ", username);
      if(username === "C1") this.createCalleePeer();
    })
  }

  public createCallerPeer(){
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(incStream => {
      // Assign local stream
      this.localStream = incStream;

      // Create local peer connection
      this.localPeerConnection = new RTCPeerConnection({iceServers});

      // Add local stream to connection
      incStream.getTracks().forEach(track => {
        this.localPeerConnection.addTrack(track, incStream); 
      });

      // Handle ice candidates for local peer connection
      this.localPeerConnection.onicecandidate = event => {
        if (event.candidate) {
          console.log('SENDING ICE CANDIDATE', event.candidate.priority)
          // Send ice candidate to signaling server
          this._socket.sendIceCandidate(event.candidate, "C1");
        }
      };

      this.localPeerConnection.ontrack = event => {
        this.remoteStream = event.streams[0];
      }

      // Create offer
      console.log("Create Offer")
      this.localPeerConnection.createOffer()
        .then(offer => {
          this.localPeerConnection.setLocalDescription(offer);

          // Send offer to signaling server
          this._socket.sendOffer(offer, "C1")

          // Handle incoming answer from remote peer
          this._socket.listenAnswer().subscribe( answer => {
            console.log('RECEIVING ANSWER', answer)
            this.localPeerConnection.setRemoteDescription(answer.answer as RTCSessionDescriptionInit);
          });
        })
        .catch(error => {
          console.error('Error creating offer:', error);
        });
    })
  }

  public createCalleePeer(){
    // Set up remote peer connection
    this.remotePeerConnection = new RTCPeerConnection({iceServers});

    // Add remote stream to connection
    this.remotePeerConnection.ontrack = event => {
      this.remoteStream = event.streams[0];
    };

    navigator.mediaDevices.getDisplayMedia({ video: true }).then( stream => {
      this.localStream = stream;
      this.remotePeerConnection.addTrack(stream.getVideoTracks()[0], stream);
    });

    // Handle incoming offer from remote peer
    this._socket.socket.on("offer", (fromUser, offer) => {

      this.remotePeerConnection.setRemoteDescription(offer as RTCSessionDescriptionInit);
      // Create answer
      this.remotePeerConnection.createAnswer()
        .then(answer => {
          this.remotePeerConnection.setLocalDescription(answer);

          // Send answer to signaling server
          this._socket.sendAnswer(answer, 'C2');
        })
        .catch(error => {
          console.error('Error creating answer:', error);
        });
      
  })
    // Handle incoming ice candidates for remote peer connection
    this._socket.listenIceCandidate().subscribe( candidate => {
      console.log('RECEIVING ICE CANDIDATE')
      this.remotePeerConnection.addIceCandidate(candidate.ice as RTCIceCandidateInit);
    });
  }

  //Listen incoming call
  public listenCall(){
    this.user.username = "C1"
  }
  
  // Create the offer
  public startCall() {
    this.createCallerPeer()
  }

  private remoteCandidate: Subject<RTCIceCandidateInit> = new Subject();
  getRemoteCandidate(value: string){
    this.remoteCandidate.next(JSON.parse(value));
  }

  // Hang up the call
  public hangupCall() {
    // this.localPeerConnection.close();
    // this.remotePeerConnection.close();
    // this.localPeerConnection = null;
    // this.remotePeerConnection = null;
    // this.startButton.disabled = false;
    // this.hangupButton.disabled = true;
    // this.localVideo.srcObject = null;
    // this.remoteVideo.srcObject = null;

    // Send hang up signal to signaling server
  }


  public triggerTest(){
    this.testFunc().subscribe( stream => {
      console.log(stream)
    } )
  }


  public testFunc(){
    const mic = {video: false, audio: true};
    return new Observable( observer => {
      // Get camera and microphone
      const micAndCam = {video: true, audio: true};
      navigator.mediaDevices.getUserMedia(mic)
      .then( stream => {
        console.log("Can and mic taken")
          observer.next(stream)
          observer.complete()
          return stream
      })
      .catch( response => {
        // If its a NotAllowedError or NotAllowedError error
        if (response?.name === "NotAllowedError" || response?.name === "NotAllowedError"){
          console.log(response.name)
          // Get only microphone
          const onlyMic = {video: false, audio: true}
          return navigator.mediaDevices.getUserMedia(onlyMic)
        } else {
          console.log(response.name)
          observer.error(response);
          observer.complete();
          return 
        }
      })
      .then( stream => {
        console.log("mic taken")
        observer.next(stream)
        observer.complete()
      })
      .catch( error => {
        observer.error(error)
      })
    })
  }
}
