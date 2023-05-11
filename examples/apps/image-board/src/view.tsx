/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import { CollaborativeImageBoard } from "@fluid-experimental/react-inputs";
import { SharedMap } from "@fluidframework/map";

interface ImageBoardObjectProps {
	map: SharedMap;
}

export const ImageBoardObjectView = (props: ImageBoardObjectProps) => {
	return (
		<div className="map-area">
			<CollaborativeImageBoard map={props.map} />
		</div>
	);
};
