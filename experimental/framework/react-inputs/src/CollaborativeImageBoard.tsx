/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useEffect, useState } from "react";
import { SharedMap } from "@fluidframework/map";
import { IFluidHandle } from "@fluidframework/core-interfaces";

export interface ICollaborativeImageBoardProps {
	/**
	 * The SharedString that will store the text from the textarea.
	 */
	map: SharedMap;

	uploadBlob(blob: ArrayBufferLike): Promise<IFluidHandle<ArrayBufferLike>>;
}

async function getImageArrayBuffer(url: string): Promise<ArrayBuffer> {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
	}
	const arrayBuffer = await response.arrayBuffer();
	return arrayBuffer;
}

export const CollaborativeImageBoard: React.FC<ICollaborativeImageBoardProps> = (
	props: ICollaborativeImageBoardProps,
) => {
	const { map } = props;

	const [mapValues, setMapValues] = useState<string[]>([]);

	const handleClick = async () => {
		const randomKey = Math.floor(Math.random() * 100);
		const randomImage = `https://picsum.photos/id/${randomKey}/200/300.jpg`;
		const imageBuffer = await getImageArrayBuffer(randomImage);

		const handle = await props.uploadBlob(imageBuffer);
		const phandle = await handle.get();
		const blob = new Blob([phandle], { type: "image/jpg" });
		const imageUrl = URL.createObjectURL(blob);
		map.set(randomKey.toString(), imageUrl);
	};

	useEffect(() => {
		/**
		 * There's been a change to the SharedString's data.
		 * This means the most recent state of the text is in the SharedString, and we need to...
		 *
		 * 1. Store the text state in React
		 *
		 * 2. If the change came from a remote source, it may have moved our selection.
		 * Compute it, update the textarea, and store it in React
		 */
		const handleValueChanged = () => {
			// const buffers: ArrayBuffer[] = Array.from(map.values());
			// console.log(buffers);
			// const imageUrls = buffers.map((buffer) =>
			// 	URL.createObjectURL(new Blob([buffer], { type: "image/jpg" })),
			// );
			// console.log(imageUrls);
			// setMapValues(imageUrls);
			// return;
			setMapValues([...map.values()]);
		};

		map.on("valueChanged", handleValueChanged);
		return () => {
			map.off("valueChanged", handleValueChanged);
		};
	}, [map]);

	return (
		// There are a lot of different ways content can be inserted into a textarea
		// and not all of them trigger a onBeforeInput event. To ensure we are grabbing
		// the correct selection before we modify the shared string we need to make sure
		// this.updateSelection is being called for multiple cases.
		<div>
			<h2>Image Board</h2>
			<button onClick={handleClick}> Random Image </button>
			<div style={{ display: "flex", flexWrap: "wrap" }}>
				{Array.from(mapValues.entries()).map(([key, value]) => (
					<div key={key} style={{ margin: "10px" }}>
						<img src={value} alt="" style={{ width: "200px" }} />
						<p>{key}</p>
					</div>
				))}
			</div>
		</div>
	);
};
