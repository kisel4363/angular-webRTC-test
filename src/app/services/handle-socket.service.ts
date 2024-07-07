import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { io, Socket } from "socket.io-client";

@Injectable({
    providedIn: 'root'
})
export class HandleSocketService {

    public socket: Socket;
    private user!: {username: string, id: string};
    private offerEmmiter: Subject<{offer: any, from: string}>;
    private answerEmmiter: Subject<{answer: any, from: string}>;
    private iceEmmiter: Subject<{ice: RTCIceCandidateInit, from: string}>;
    private connectionEmmiter: Subject<string>;

    // public offer: any;

    constructor() {
        this.offerEmmiter = new Subject<{offer: any, from: string}>();
        this.answerEmmiter = new Subject<{answer: any, from: string}>();
        this.iceEmmiter = new Subject<{ice: RTCIceCandidateInit, from: string}>();
        this.connectionEmmiter = new Subject<string>();
        // Initialize the socket connection
        this.socket = io("https://192.168.122.18:8000");
        this.socket.on('connection', (user) => {
            this.user = user;
            this.connectionEmmiter.next(user.username);
        })
        this.socket.on("offer", (fromUser, data) => {
            this.offerEmmiter.next({offer: data, from: fromUser});
        })
        
        this.socket.on("answer", (fromUser, data) => {
            this.answerEmmiter.next({answer: data, from: fromUser});
        })
        this.socket.on("iceCandidate", (fromUser, data) => {
            this.iceEmmiter.next({ice: data, from: fromUser});
        })
        this.socket.connect()
    }

    sendOffer(data: any, contact: string){
        this.socket.emit("offer", this.user.username, contact, data)
    }

    sendAnswer(data: any, contact: string){
        this.socket.emit("answer", this.user.username, contact, data)
    }

    sendIceCandidate( data: any, contact: string ){
        this.socket.emit("iceCandidate", this.user.username, contact, data)
    }

    callAllPeers(data:string){
        this.socket.emit("callAllPeers", this.user.username, data)
    }

    listenConnection(): Observable<string>{
        return this.connectionEmmiter.asObservable();
    }

    listenOffer(): Observable<{offer: any, from: string}>{
        return this.offerEmmiter.asObservable();
    }

    listenAnswer(): Observable<{answer: any, from: string}>{
        return this.answerEmmiter.asObservable();
    }

    listenIceCandidate(): Observable<{ice: RTCIceCandidateInit, from: string}>{
        return this.iceEmmiter.asObservable();
    }



    // Function to handle received data from the server
    handleReceivedData(callback: (data: string) => void): void {
        // Listen for the 'receivedData' event from the server
        this.socket.on('receivedData', (data: string) => {
            // Invoke the callback function with the received data
            callback(data);
        });
    }
}



