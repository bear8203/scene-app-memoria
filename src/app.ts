import * as MRE from "@microsoft/mixed-reality-extension-sdk";
import { Asset, Guid, User } from "@microsoft/mixed-reality-extension-sdk";
import axios from 'axios';
import { Component, Video } from "./video";

const RPC = {
    ObjectDetected: "object-detected",
    LocationChanged: "location-changed",
    UserRegister: "user-register"
}

interface ComponentInfo {
    memoId: string,
    type: string,
    obj: Component,
    positioned: boolean,
}

interface UserInfo {
    user: MRE.User,
    location: string,
    token: string,
    remainedPositions: Array<{ position: {x: number, y: number, z: number}, type: string, locationId: string }>
}

export default class Memoria {
    private assets: MRE.AssetContainer;
    private userMap: { [id: string]: UserInfo }

    private userObjects: { [userId: string]: Array<ComponentInfo> };

    constructor(private ctx: MRE.Context, private host: MRE.WebHost) {
        this.userMap = {};
        this.userObjects = {};
        this.assets = new MRE.AssetContainer(this.ctx);
        this.ctx.onStarted(() => this.started());
        this.ctx.onUserJoined(this.onUserJoined.bind(this));
        this.ctx.rpc.on(RPC.LocationChanged, this.onLocationChanged.bind(this));
    }

    private async started() {
        console.log("START Application");
        const video = new Video(this.ctx, this.assets, 0.2, 0.2, {x: 0, y: 0, z: 0}, `${this.host.baseUrl}/Big_Buck_Bunny_720_10s_10MB.mp4`);
        video.show();
    }

    private onUserJoined(user: MRE.User): void {
        console.log(`user: ${user.id}, ${user.name}, ${user.context == this.ctx}`);
        for (const k in user.properties) {
            console.log (`      ${k} : ${user.properties[k]}`);
        }

        const userId = user.properties['userId'];
        this.userMap[userId] = {
            user,
            location: "",
            token: user.properties['token'],
            remainedPositions: []
        }
        this.removeNotesFromUser(userId);
        this.userObjects[userId] = [];
        console.log(`user: ${user.name}[${userId}] is registed`);
    }

    private onLocationChanged(options: { userId: Guid; }, ...args: any[]) : void
    {
        console.log(`location position is changed.`);
    }

    private removeNotesFromUser(userId: string) {
        if (userId in this.userObjects) {
            const objs = this.userObjects[userId];
            for (let i=0; i < objs.length; i++) {
                objs[i].obj.hide();
            }
            this.userObjects[userId] = [];
        }
    }
}
