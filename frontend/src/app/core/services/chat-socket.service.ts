import { Injectable } from '@angular/core';
import { Device } from 'mediasoup-client';
import { Producer, ProducerOptions } from 'mediasoup-client/lib/Producer';
import {
    MediaKind,
    RtpCapabilities,
    RtpParameters,
} from 'mediasoup-client/lib/RtpParameters';
import {
    DtlsParameters,
    Transport,
    TransportOptions,
} from 'mediasoup-client/lib/Transport';
import { io, Socket } from 'socket.io-client';

@Injectable({
    providedIn: 'root',
})
export class ChatSocketService {
    private readonly endpoint = 'https://localhost:3000/mediasoup';
    private socket = io(this.endpoint, { autoConnect: false });

    private device: Device;

    constructor() {
        this.device = new Device();
    }

    connect() {
        this.socket.auth = { username: 'TestUser' };
        this.socket.connect();
        this.registerSocketEvents();
    }

    registerSocketEvents() {
        this.socket.on('new-producer', (data) => {
            console.log('new-producer', data);
        });
    }

    async loadDevice() {
        const routerRtpCapabilities = await new Promise<RtpCapabilities>(
            (resolve, reject) => {
                this.socket.emit(
                    'getRouterRtpCapabilities',
                    (data: RtpCapabilities) => resolve(data)
                );
            }
        );

        // first, get routers RTP capabilities
        await this.device.load({ routerRtpCapabilities });
        // send client capabilities
        this.socket.emit(
            'setClientRtpCapabilities',
            this.device.rtpCapabilities
        );
    }

    // send media
    async createSendTransport(): Promise<Transport> {
        const transportOptions = await new Promise<TransportOptions>(
            (resolve, reject) => {
                this.socket.emit(
                    'createWebRtcTransport',
                    { send: true },
                    (data: TransportOptions) => resolve(data)
                );
            }
        );
        return this.device.createSendTransport(transportOptions);
    }

    async createReceiveTransport(): Promise<Transport> {
        const transportOptions = await new Promise<TransportOptions>(
            (resolve, reject) => {
                this.socket.emit(
                    'createWebRtcTransport',
                    (data: TransportOptions) => resolve(data)
                );
            }
        );
        return this.device.createRecvTransport(transportOptions);
    }

    async onTransportConnect(
        transport: Transport,
        dtlsParameters: DtlsParameters
    ) {
        await new Promise<void>((resolve, reject) => {
            this.socket.emit(
                'transport-connect',
                { transportId: transport.id, dtlsParameters },
                () => resolve()
            );
        });
    }

    async onTransportProduce(
        transport: Transport,
        parameters: {
            kind: MediaKind;
            rtpParameters: RtpParameters;
            appData?: object;
        }
    ) {
        return await new Promise<any>((resolve, reject) => {
            this.socket.emit(
                'transport-produce',
                { transportId: transport.id, ...parameters },
                (data: any) => resolve(data)
            );
        });
    }

    async createConsumer() {}

    async createProducer(track: MediaStreamTrack): Promise<Producer> {
        const transport = await this.createSendTransport();
        transport.on(
            'connect',
            async ({ dtlsParameters }, callback, errback) => {
                // Signal local DTLS parameters to the server side transport.
                try {
                    await this.onTransportConnect(transport, dtlsParameters);
                    // Tell the transport that parameters were transmitted.
                    callback();
                } catch (error) {
                    // Tell the transport that something was wrong.
                    errback(error);
                }
            }
        );
        transport.on(
            'produce',
            async (
                parameters: {
                    kind: MediaKind;
                    rtpParameters: RtpParameters;
                    appData?: object | undefined;
                },
                callback: any,
                errback: any
            ) => {
                // Signal local DTLS parameters to the server side transport.
                try {
                    let data = await this.onTransportProduce(
                        transport,
                        parameters
                    );
                    console.log(data);
                    // Tell the transport that parameters were transmitted.
                    callback({ id: data.id });
                } catch (error) {
                    // Tell the transport that something was wrong.
                    errback(error);
                }
            }
        );
        let producer = await transport.produce({
            track,
        });
        return producer;
    }

    public async getUserMedia(
        constraints: MediaStreamConstraints | undefined
    ): Promise<MediaStream | null> {
        let stream = null;
        try {
            stream = await navigator.mediaDevices.getUserMedia(constraints);
            /* use the stream */
        } catch (err) {
            /* handle the error */
        }
        return stream;
    }
}
