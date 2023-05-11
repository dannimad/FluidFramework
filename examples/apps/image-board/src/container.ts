/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { ModelContainerRuntimeFactory } from "@fluid-example/example-utils";
import { IContainer } from "@fluidframework/container-definitions";
import { IContainerRuntime } from "@fluidframework/container-runtime-definitions";
import { requestFluidObject } from "@fluidframework/runtime-utils";

import { ImageBoardObject } from "./fluid-object";

export interface IImageBoardObjectAppModel {
	readonly imageBoardObject: ImageBoardObject;
}

class ImageBoardObjectAppModel implements IImageBoardObjectAppModel {
	public constructor(public readonly imageBoardObject: ImageBoardObject) {}
}

const imageBoardObjectId = "collaborative-map";

export class ImageBoardObjectContainerRuntimeFactory extends ModelContainerRuntimeFactory<IImageBoardObjectAppModel> {
	constructor() {
		super(
			new Map([ImageBoardObject.getFactory().registryEntry]), // registryEntries
		);
	}

	/**
	 * {@inheritDoc ModelContainerRuntimeFactory.containerInitializingFirstTime}
	 */
	protected async containerInitializingFirstTime(runtime: IContainerRuntime) {
		const imageBoardObject = await runtime.createDataStore(ImageBoardObject.getFactory().type);
		await imageBoardObject.trySetAlias(imageBoardObjectId);
	}

	/**
	 * {@inheritDoc ModelContainerRuntimeFactory.createModel}
	 */
	protected async createModel(runtime: IContainerRuntime, container: IContainer) {
		const imageBoardObject = await requestFluidObject<ImageBoardObject>(
			await runtime.getRootDataStore(imageBoardObjectId),
			"",
		);
		return new ImageBoardObjectAppModel(imageBoardObject);
	}
}
