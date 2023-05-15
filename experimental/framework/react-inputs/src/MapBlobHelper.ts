/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { IEvent } from "@fluidframework/common-definitions";
import { TypedEventEmitter } from "@fluidframework/common-utils";
import { IFluidHandle } from "@fluidframework/core-interfaces";
// import { SequenceDeltaEvent, SharedString } from "@fluidframework/sequence";
import { SharedMap } from "@fluidframework/map";

export interface IMapBlobHelperTextChangedEventArgs {
	buffers: ArrayBuffer[];
}

export interface IMapBlobHelperEvents extends IEvent {
	(event: "mapChanged", listener: (event: IMapBlobHelperTextChangedEventArgs) => void);
}

/**
 * Given a SharedMap will provide a friendly API for use.
 */
export class MapBlobHelper extends TypedEventEmitter<IMapBlobHelperEvents> {
	private readonly _sharedMap: SharedMap;
	uploadBlob: (blob: ArrayBufferLike) => Promise<IFluidHandle<ArrayBufferLike>>;
	private _buffers: ArrayBuffer[] = [];

	public get buffers(): ArrayBuffer[] {
		return this._buffers;
	}
	public set buffers(value: ArrayBuffer[]) {
		this._buffers = value;
	}

	constructor(
		sharedMap: SharedMap,
		uploadBlob: (blob: ArrayBufferLike) => Promise<IFluidHandle<ArrayBufferLike>>,
	) {
		super();
		this._sharedMap = sharedMap;
		this._sharedMap.on("valueChanged", this.updateMapHandler);
		this.uploadBlob = uploadBlob;
	}

	/**
	 * @returns The full text stored in the SharedMap as a string.
	 */
	public getMap(): SharedMap {
		return this._sharedMap;
	}

	public async setBuffers(): Promise<ArrayBuffer[]> {
		try {
			const buffers: ArrayBuffer[] = [];
			const handles = Array.from(this._sharedMap.values());
			for (const handle of handles) {
				const buffer = await handle.get();
				buffers.push(buffer);
			}
			this.buffers = buffers;
			return this.buffers;
		} catch (error) {
			console.log(error);
			throw error;
		}
	}

	/**
	 * Insert the string provided at the given position.
	 */
	public set(key: string, value: ArrayBuffer): void {
		const reader = new FileReader();
		reader.readAsArrayBuffer(new Blob([value]));
		reader.onloadend = async () => {
			if (reader.result instanceof ArrayBuffer) {
				const handle = await this.uploadBlob(reader.result);
				this._sharedMap.set(key, handle);
			}
		};
	}

	public get(key: string): ArrayBuffer | undefined {
		return this._sharedMap.get(key);
	}

	/**
	 * Called when the data of the SharedMap changes.  We update our cached text and emit the "textChanged" event.
	 * Most of the work is to build up the appropriate transformPosition function, which allows the caller to translate
	 * pre-update positions to post-update positions (e.g. to find where a caret should move to).
	 */
	private readonly updateMapHandler = (changed, local, target) => {
		const wrong = async () => {
			await this.setBuffers();
			this.emit("MapChanged", this.buffers);
		};
		wrong().catch((error) => console.log(error));
	};
}
