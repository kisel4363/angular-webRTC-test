export enum EnumCallType { VIDEO = "VIDEO", VOZ = "VOZ" };

export interface ICallUser{
    id: string,
    name: string,
    photo: string,
    audio: boolean,
    video: boolean,
    camera?: MediaStream,
    screen?: MediaStream,
    sound?: MediaStream,
    type: EnumUserTypeInCall,
    state: EnumUserStateInCall,
    connection?: RTCPeerConnection, // Do not send by socket
}
export enum EnumCallState { RINGING="RINGING", ACCEPTED="ACCEPTED", REJECTED="REJECTED" }
export interface ICallData{
    id: string // id de la llamada(es el room del socket)
    endDate: Date,
    startDate: Date,
    users: ICallUser[],
}
export enum EnumCallResponse{ REJECTED="REJECTED", ACCEPTED="ACCEPTED" }
export interface IResponseCallData{
    response: EnumCallResponse
}

export enum EnumCalliinServiceState {
    ON_CALL="ON_CALL",
    CALLING="CALLING",
    INCOMING_CALL="INCOMING_CALL",
    NO_CALL="NO_CALL",
    TEST_CALLING_INTERFACE="TEST_CALLING_INTERFACE",
}
export enum EnumUserTypeInCall{ OWNER="OWNER", MEMBER="MEMBER"};
export interface ISaveCallUsers{ id:string, type: EnumUserTypeInCall }
export interface ISaveCall{
    id: string // id de la llamada(es el room del socket)
    endDate: Date,
    startDate: Date,
    users: ISaveCallUsers[],
    state: EnumUserStateInCall
}
export enum EnumUserStateInCall{
    UNCALLED="UNCALLED", RINGING="RINGING", CANCELLED="CANCELLED", REJECTED="REJECTED", ACCEPTED="ACCEPTED", HANGED="HANGED"
}

export interface IReqAddGuest{
    host: string, guest: string, call: ICallData
}

export interface ICallBasicUserData{
    id: string, photo: string, name: string
}

