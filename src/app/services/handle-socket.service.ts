import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { io, Socket } from "socket.io-client";

@Injectable({
    providedIn: 'root'
})
export class HandleSocketService {

    public socket: Socket;
    private user!: {username: string, id: string};

    private offerEmmiter = new Subject<{offer: string, from: string}>();
    private answerEmmiter = new Subject<{answer: string, from: string}>();

    constructor() {
        // Initialize the socket connection
        this.socket = io("https://192.168.228.18:8000");
        this.socket.on('connection', (user) => {
            this.user = user;
            console.warn("IM USER ", user);
        })
        this.socket.on("offer", (fromUser, data) => {
            this.offerEmmiter.next({offer: data, from: fromUser});
        })
        this.socket.on("answer", (fromUser, data) => {
            this.answerEmmiter.next({answer: data, from: fromUser});
        })
        this.socket.connect()
    }

    sendOffer(data: string, contact: string){
        this.socket.emit("offer", this.user.username, contact, data)
    }

    sendAnswer(data: string, contact: string){
        this.socket.emit("answer", this.user.username, contact, data)
    }

    callAllPeers(data:string){
        this.socket.emit("callAllPeers", this.user.username, data)
    }

    listenOffer(): Observable<{offer: string, from: string}>{
        return this.offerEmmiter.asObservable();
    }

    listenAnswer(): Observable<{answer: string, from: string}>{
        return this.answerEmmiter.asObservable();
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



