
import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import { AlphaMode, Color3, Quaternion, TextFontFamily, Vector3 } from '@microsoft/mixed-reality-extension-sdk';
import { createCubeMesh, createMaterial, createMaterialFromUri, createTexture } from './assets';

export interface Component {
    hide(): void;
    show(): void;
    move(position: {x?: number, y?: number, z?: number}): void;
}

export const BackgroundColor = new MRE.Color3(0.25, 0.25, 0.25);

export class Video implements Component {
    private quad: MRE.Actor;
    private videoInstance: MRE.MediaInstance;
    private backgroundMaterial: MRE.Material;

    constructor(private ctx: MRE.Context,
                private am: MRE.AssetContainer,
                private width: number,
                private height: number,
                private position: { x: number, y: number, z: number },
                private url?: string,
                private user?: MRE.User) {
    }

    public hide(): void {
        this.destroy();
    }

    public show(): void {
        if (!this.quad) {
            this.init();
        }
    }

    public move(position: {x?: number, y?: number, z?: number}) {
        if (this.quad) {
            const pos = this.quad.transform.app.position.clone();
            if (position.x) pos.x = position.x;
            if (position.y) pos.y = position.y;
            if (position.z) pos.z = position.z;
            this.quad.transform.app.position = pos;
        }
        else {
            if (position.x) this.position.x = position.x;
            if (position.y) this.position.y = position.y;
            if (position.z) this.position.z = position.z;
        }
    }

    private init() {
        console.log('quad init');
        this.backgroundMaterial = this.am.createMaterial('background', {
			color: BackgroundColor
		});
        this.quad = MRE.Actor.Create(this.ctx, {
            actor: {
                name: 'Video',
                appearance: {
					meshId: this.am.createBoxMesh('wall', 2, 2, 0.1).id,
					materialId: this.backgroundMaterial.id
				},
                exclusiveToUser: this.user ? this.user.id : undefined,
                transform: {
                    app: {
                        position: this.position
                    },
                    local: {
                        position: {x: 0, y: 0, z: 0},
                        scale: {x: 1, y: 1, z: 1},
                        rotation: {x: 0, y: 0, z: 0}
                    }
                },
                collider: { geometry: { shape: MRE.ColliderType.Auto } }
            }
        });

        console.log('videostream init');
        const videoStream = this.am.createVideoStream('videoStream', { uri: this.url });
        this.videoInstance = this.quad.startVideoStream(videoStream.id, {volume: 0.2, looping: false, spread: 0.7, rolloffStartDistance: 2.5});
    }

    private destroy() {
        this.videoInstance.stop();
        this.videoInstance = null;
        this.quad?.destroy();
    }
}