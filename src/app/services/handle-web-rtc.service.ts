import { Injectable, OnInit } from '@angular/core'; 
import { BehaviorSubject, Observable } from 'rxjs';

enum EnumPeerType { CALLER = "Caler", CALLEE = "Callee"}

@Injectable({
    providedIn: 'root'
})
export class HandleWebRtcService {
    private peerType = "";
    private callerPeer!: RTCPeerConnection;
    private calleePeer!: RTCPeerConnection;

    private callerDataChannel!: RTCDataChannel;
    private calleeDataChannel!: RTCDataChannel;

    private remoteStreamsEmitter: BehaviorSubject<MediaStream[]> = new BehaviorSubject<MediaStream[]>([]);
    private remoteStreams: MediaStream[] = [];

    constructor() { }

    setUpCallerPeer(streams: {video: MediaStream}): Promise<string>{
        // Create a new RTCPeerConnection with offer setted
        return new Promise((resolve, reject) => {
            if (this.peerType !== "") { reject("Peer already setted"); }
            this.peerType = "caller";
            this.callerPeer = new RTCPeerConnection(configuration);
            // Add video track to callerPeer
            this.callerPeer.addTrack(streams.video.getTracks()[0], streams.video);
            // Add listener for remote streams
            this.callerPeer.ontrack = (e: RTCTrackEvent) => {
                this.remoteStreams = [...e.streams];
                console.log("Reading caller remote streams: ", this.remoteStreams);
                this.remoteStreamsEmitter.next(this.remoteStreams);
            }
            // Handle RTCIceCandidates gathering
            this.callerPeer.onicecandidate = (event) => {
                console.log('ice gathering state', this.callerPeer.iceGatheringState, 'iceCandidate ', this.callerPeer.localDescription)
                // if(this.callerPeer.iceGatheringState !== 'complete') return;
                resolve(JSON.stringify(this.callerPeer.localDescription));
            };
            this.callerPeer.onicecandidateerror = (event) => {
                this.peerType = "";
                reject(event);
            }
            // Hnadling offer creation
            this.callerPeer.createOffer().then((offer) => {
                if (!offer) { this.peerType = ""; reject("Offer is null"); }
                this.callerPeer.setLocalDescription(offer);
            }).catch((error) => {
                this.peerType = "";
                reject(error);
            })
        });
    }

    setUpDataChannel(){
        return new Promise((resolve, reject) => {
            if (!this.peerType) throw new Error("Peer not setted");
            if (this.peerType === "caller") {
                this.setUpCallerDataChannel();
                resolve(EnumPeerType.CALLER);
            } else {
                this.setUpCalleeDataChannel().then( () => {
                    resolve(EnumPeerType.CALLEE);
                });
            }
        });
    }

    getRemoteStreams(): Observable<MediaStream[]>{
        return this.remoteStreamsEmitter.asObservable();
    }

    setCalleeAnswer(answer: string): Promise<void>{
        return new Promise((resolve, reject) => {
            console.log("peerType: ", this.peerType)
            if (this.peerType !== "caller") { reject("Peer not setted"); }
            const parsedAnswer = JSON.parse(answer) as RTCSessionDescription;
            return this.callerPeer.setRemoteDescription(parsedAnswer);
        })
    }

    private setUpCallerDataChannel(){
        this.callerDataChannel = this.callerPeer.createDataChannel("dataChannel");
    }

    private setUpCalleeDataChannel(){
        return new Promise((resolve, reject) => {
            this.calleePeer.ondatachannel = (event) => {
                this.calleeDataChannel = event.channel;
            }
        })
    }

    getDataChannelMessages(): Observable<string>{
        return new Observable(observer => {
            if (!this.peerType) throw new Error("Peer not setted");
            if (this.peerType === "caller") {
                this.callerDataChannel.onmessage = (event) => {
                    observer.next(event.data);
                }
            } else {
                this.calleeDataChannel.onmessage = (event) => {
                    observer.next(event.data);
                }
            }
        });
    }

    getCallerOffer(): string{
        if(this.peerType !== "caller") throw new Error(this.peerType? "Already exists a callee peer" : "Peer not setted");
        return JSON.stringify(this.callerPeer.localDescription);
    }

    getCalleeOffer(): string{
        if(this.peerType !== "callee") throw new Error(this.peerType? "Already exists a caller peer" : "Peer not setted");
        return JSON.stringify(this.calleePeer.localDescription);
    }

    setUpCalleePeer(offer: string, streams: {video: MediaStream}): Promise<string>{
        return new Promise((resolve, reject) => {

            if (this.peerType !== "") { reject("Peer already setted"); }

            this.peerType = "callee";
            const parsedOffer = JSON.parse(offer) as RTCSessionDescription;
            this.calleePeer = new RTCPeerConnection(configuration);
            // Add local track to calleePeer
            this.calleePeer.addTrack(streams.video.getTracks()[0], streams.video);

            // Add listener for remote streams
            this.calleePeer.ontrack = (e: RTCTrackEvent) => {
                this.remoteStreams = [...e.streams];
                console.log("Reading callee remote streams: ", this.remoteStreams);
                this.remoteStreamsEmitter.next(this.remoteStreams);
            }

            this.calleePeer.setRemoteDescription(parsedOffer);
            this.calleePeer.onicecandidate = () => {
                // if(this.calleePeer.iceGatheringState !== 'complete') return;
                resolve( JSON.stringify(this.calleePeer.localDescription));
            };
            this.calleePeer.onicecandidateerror = e => {
                this.peerType = "";
                reject(e);
            }
            this.calleePeer.createAnswer().then((answer) => {
                if (!answer) { this.peerType = ""; reject("Answer is null"); }
                this.calleePeer.setLocalDescription(answer);
            })
            .catch((error) => { this.peerType = ""; reject(error);})
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