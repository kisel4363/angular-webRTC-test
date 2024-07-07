import { Injectable, OnInit } from '@angular/core'; 
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { RemoteUser } from '../app.component';

enum EnumPeerType { CALLER = "Caler", CALLEE = "Callee"}

// @Injectable({
//     providedIn: 'root'
// })
export class HandleWebRtcService {
    private calleePeerIndex = -1;
    private callerPeerIndex = -1;
    private callerPeer: RTCPeerConnection[] = [];
    get currCallerPeer(): RTCPeerConnection {
        if (this.callerPeer.length === 0) throw new Error("No callee peers available");
        return this.callerPeer[this.callerPeerIndex];
    }
    set currCallerPeer(peer: RTCPeerConnection) {
        this.callerPeer = [...this.callerPeer, peer ];
    }
    private calleePeer: RTCPeerConnection[] = [];
    get currCalleePeer(): RTCPeerConnection {
        if (this.calleePeer.length === 0) throw new Error("No callee peers available");
        return this.calleePeer[this.calleePeerIndex];
    }
    set currCalleePeer(peer: RTCPeerConnection) {
        this.calleePeer = [...this.calleePeer, peer];
    }
    private remoteStreamsEmitter = new Subject<RemoteUser>();

    constructor() { }

    callUser(userId: string, streams: {video: MediaStream}){
        
    }
    setUpCallerPeer(streams: {camera: MediaStream, screen: MediaStream}): Promise<string>{
        // Create a new RTCPeerConnection with offer setted
        return new Promise((resolve, reject) => {
            this.callerPeerIndex++;
            this.currCallerPeer = new RTCPeerConnection(configuration);
            // Add video track to callerPeer
            const audio = streams.camera.getAudioTracks()[0];
            this.currCallerPeer.addTrack(audio, streams.camera);
            const video = streams.camera.getVideoTracks()[0];
            this.currCallerPeer.addTrack(video, streams.camera);
            const screen = streams.screen.getVideoTracks()[0];
            this.currCallerPeer.addTrack(screen, streams.screen);
            console.log('audio', { hint: audio.contentHint, label: audio.label, kind: audio.kind, id: audio.id })
            console.log('camera', { hint: video.contentHint, label: video.label, kind: video.kind, id: video.id })
            console.log('screen', { hint: screen.contentHint, label: screen.label, kind: screen.kind, id: screen.id })
            // Add listener for remote streams
            this.currCallerPeer.ontrack = (e: RTCTrackEvent) => {
                // console.log("RTCTrackEvent", e)
                // const remoteUser: RemoteUser = {
                //     camera: e.streams[0],
                // }
                // this.remoteStreamsEmitter.next(remoteUser);
                const tracks = e.streams[0].getTracks();
                if(tracks.length < 2) return 
                const alreadyEmited = this.emitedStreamsIds.find( id => id === e.streams[0].id);
                if(alreadyEmited) return 
                this.emitedStreamsIds = [...this.emitedStreamsIds, e.streams[0].id]
                const remoteUser: RemoteUser = {
                    camera: e.streams[0],
                }
                this.remoteStreamsEmitter.next(remoteUser);
            }
            // Handle RTCIceCandidates gathering
            this.currCallerPeer.onicecandidate = (event) => {
                console.log('ice gathering state', this.currCallerPeer.iceGatheringState, 'iceCandidate ', this.currCallerPeer.localDescription)
                // if(this.currCallerPeer.iceGatheringState !== 'complete') return;
                resolve(JSON.stringify(this.currCallerPeer.localDescription));
            };
            this.currCallerPeer.onicecandidateerror = (event) => { reject(event); }
            // Hnadling offer creation
            this.currCallerPeer.createOffer().then((offer) => {
                this.currCallerPeer.setLocalDescription(offer);
            })
            .catch((error) => { reject(error); })
        });
    }
    sendOtherStream(stream: MediaStream){
        this.currCallerPeer.addTransceiver(stream.getVideoTracks()[0])
    }
    async switchCam(): Promise<MediaStream>{
        const facingMode = 'environment';
        return navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: true }).then( stream => {
            const newVideoTrack = stream.getVideoTracks()[0];
            console.log('Printing senders stats')
            this.calleePeer[this.calleePeerIndex].getSenders().forEach( sender => {
                console.log({kind: sender.track?.kind, id: sender.track?.id, label: sender.track?.label})
                // sender.track?.kind === "video"
            } )  //.replaceTrack(newVideoTrack)
            return stream
        })
    }
    getRemoteStreams(): Observable<RemoteUser>{
        return this.remoteStreamsEmitter.asObservable();
    }
    setCalleeAnswer(answer: string): Promise<void>{
        const parsedAnswer = JSON.parse(answer) as RTCSessionDescription;
        return this.currCallerPeer.setRemoteDescription(parsedAnswer);
    }
    getCallerOffer(): string{
        return JSON.stringify(this.currCallerPeer.localDescription);
    }
    getCalleeOffer(): string{
        return JSON.stringify(this.currCalleePeer.localDescription);
    }
    protected emitedStreamsIds: string[] = [];
    setUpCalleePeer(offer: {offer: string, from: string}, streams: {camera: MediaStream, screen: MediaStream}): Promise<string>{
        return new Promise((resolve, reject) => {
            this.calleePeerIndex++;
            // this.peerType = [...this.peerType, ""];
            // this.peerType[this.peerIndex] = "callee";
            const parsedOffer = JSON.parse(offer.offer) as RTCSessionDescription;
            console.log("PARSED OFFER", parsedOffer)
            this.currCalleePeer = new RTCPeerConnection(configuration);
            // Add local track to calleePeer
            const audio = streams.camera.getAudioTracks()[0];
            this.currCalleePeer.addTrack(audio, streams.camera);
            const video = streams.camera.getVideoTracks()[0];
            this.currCalleePeer.addTrack(video, streams.camera);
            const screen = streams.screen.getVideoTracks()[0];
            this.currCalleePeer.addTrack(screen, streams.screen);
            // Add listener for remote streams
            
            this.currCalleePeer.ontrack = (e: RTCTrackEvent) => {
                const tracks = e.streams[0].getTracks();
                if(tracks.length < 2) return 
                const alreadyEmited = this.emitedStreamsIds.find( id => id === e.streams[0].id);
                if(alreadyEmited) return 
                this.emitedStreamsIds = [...this.emitedStreamsIds, e.streams[0].id]
                const remoteUser: RemoteUser = {
                    camera: e.streams[0],
                }
                this.remoteStreamsEmitter.next(remoteUser);
            }

            this.currCalleePeer.setRemoteDescription(parsedOffer);
            this.currCalleePeer.onicecandidate = () => {
                console.log("Returning answer", JSON.stringify(this.currCalleePeer.localDescription))
                resolve( JSON.stringify(this.currCalleePeer.localDescription));
            };
            this.currCalleePeer.onicecandidateerror = e => {
                reject(e);
            }
            this.currCalleePeer.createAnswer().then((answer) => {
                this.currCalleePeer.setLocalDescription(answer);
            })
            .catch((error) => { reject(error);})
        });
    }
}

const configuration = {
    iceServers: [
        {
            urls: "stun:stun.relay.metered.ca:80",
        },
        {
            urls: "turn:global.relay.metered.ca:80",
            username: "ef20ea7fb58f60a104894329",
            credential: "KccuwUQetvqKrtJB",
        },
        {
            urls: "turn:global.relay.metered.ca:80?transport=tcp",
            username: "ef20ea7fb58f60a104894329",
            credential: "KccuwUQetvqKrtJB",
        },
        {
            urls: "turn:global.relay.metered.ca:443",
            username: "ef20ea7fb58f60a104894329",
            credential: "KccuwUQetvqKrtJB",
        },
        {
            urls: "turns:global.relay.metered.ca:443?transport=tcp",
            username: "ef20ea7fb58f60a104894329",
            credential: "KccuwUQetvqKrtJB",
        },
    ]
}