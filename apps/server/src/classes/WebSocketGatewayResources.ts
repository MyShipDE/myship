export const WebSocketGatewayResources = {
    AuthEvent: 'gateway:auth',
    AuthFailed: 'gateway:auth:fail',
    AuthSuccess: 'gateway:auth:ok',
    BeginImportOfTrack: 'gateway:import:track:begin',
    EndImportOfTrack: 'gateway:import:track:end',
    ChunkOfTrack: 'gateway:import:track:chunk',
    ChunkOfTrackReceived: 'gateway:import:track:chunk:received',
    ErrorWhileImportingTrack: 'gateway:import:track:error',
    ImportTrackFinished: 'gateway:import:track:finished'
}

export class WebSocketGatewayTrackRecordReceived {
    recordId: number;
    dataCount: number;
}