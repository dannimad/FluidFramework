/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { DataObject, DataObjectFactory } from "@fluidframework/aqueduct";
import { IFluidHandle } from "@fluidframework/core-interfaces";
import { SharedMap } from "@fluidframework/map";

/**
 * ImageBoardObject uses the React ImageBoardObjectArea to load a collaborative HTML <textarea>
 */
export class ImageBoardObject extends DataObject {
	private readonly mapKey = "mapKey";

	private _map: SharedMap | undefined;
	public get map() {
		if (this._map === undefined) {
			throw new Error("The SharedMap was not initialized correctly");
		}
		return this._map;
	}

	public static get Name() {
		return "@fluid-example/image-board";
	}

	private static readonly factory = new DataObjectFactory(
		ImageBoardObject.Name,
		ImageBoardObject,
		[SharedMap.getFactory()],
		{},
	);

	public async uploadBlob(blob: ArrayBufferLike): Promise<IFluidHandle<ArrayBufferLike>> {
		return this.runtime.uploadBlob(blob);
	}

	public static getFactory() {
		return this.factory;
	}

	protected async initializingFirstTime() {
		// Create the SharedMap and store the handle in our root SharedDirectory
		const map = SharedMap.create(this.runtime);
		this.root.set(this.mapKey, map.handle);
	}

	protected async hasInitialized() {
		// Store the map if we are loading the first time or loading from existing
		this._map = await this.root.get<IFluidHandle<SharedMap>>(this.mapKey)?.get();
	}
}
