/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import { CollaborativeImageBoard, MapBlobHelper } from "@fluid-experimental/react-inputs";
import { SharedMap } from "@fluidframework/map";
import { IFluidHandle } from "@fluidframework/core-interfaces";

interface ImageBoardObjectProps {
	map: SharedMap;
	uploadBlob(blob: ArrayBufferLike): Promise<IFluidHandle<ArrayBufferLike>>;
}

export const ImageBoardObjectView = (props: ImageBoardObjectProps) => {
	return (
		<div className="map-area">
			<CollaborativeImageBoard
				mapBlobHelper={new MapBlobHelper(props.map, props.uploadBlob.bind(this))}
			/>
		</div>
	);
};
