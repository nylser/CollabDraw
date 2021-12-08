import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { async } from '@angular/core/testing';
import { MediaKind, RtpParameters } from 'mediasoup-client/lib/RtpParameters';
import { ChatSocketService } from '../../services/chat-socket.service';

@Component({
    selector: 'app-testchat',
    templateUrl: './testchat.component.html',
    styleUrls: ['./testchat.component.scss'],
})
export class TestchatComponent implements OnInit {
    @ViewChild('ownVideo')
    ownVideo?: ElementRef<HTMLVideoElement>;

    ownSource: MediaStream | undefined | null;

    useVideo = true;
    useMicrophone = true;

    constructor(private chatSocket: ChatSocketService) {}

    async ngOnInit() {
        this.chatSocket.connect();
        await this.chatSocket.loadDevice();
    }

    async getUserMedia() {
        let stream = await this.chatSocket.getUserMedia({
            video: this.useVideo,
            audio: this.useMicrophone,
        });
        if (!stream) {
            return;
        }

        this.ownSource = stream;
        if (this.ownSource && this.ownVideo) {
            this.startOwnStream(this.ownSource, this.ownVideo.nativeElement);
        }

        let videoProducer = await this.chatSocket.createProducer(
            stream.getVideoTracks()[0]
        );
        let audioProducer = await this.chatSocket.createProducer(
            stream.getAudioTracks()[0]
        );
        console.log(videoProducer, audioProducer);
    }

    startOwnStream(stream: MediaStream, videoElement: HTMLVideoElement) {
        videoElement.autoplay = true;
        videoElement.srcObject = new MediaStream([...stream.getVideoTracks()]);
    }
}
