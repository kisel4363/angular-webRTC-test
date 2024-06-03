import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { io, Socket } from "socket.io-client";

@Injectable({
    providedIn: 'root'
})
export class HandleSocketService {

    public socket: Socket;
    private user: any;

    private offetEmmiter = new Subject<string>();
    private answerEmmiter = new Subject<string>();
    private connectionEmmiter = new Subject<string>();

    constructor() {
        // Initialize the socket connection
        this.socket = io("https://192.168.217.18:8000");

        this.socket.on('connection', (user) => {
            this.user = user;

        })
        
        this.socket.on("offer", (data) => {
            this.offetEmmiter.next(data);
        })
        
        this.socket.on("answer", (data) => {
            this.answerEmmiter.next(data);
        })
        
        this.socket.connect()
    }

    sendOffer(data: string){
        this.socket.emit("offer", data, "C2")
    }

    sendAnswer(data: string){
        this.socket.emit("answer", data, "C1")
    }

    listenOffert(): Observable<string>{
        return this.offetEmmiter.asObservable();
    }

    listenAnswer(): Observable<string>{
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



