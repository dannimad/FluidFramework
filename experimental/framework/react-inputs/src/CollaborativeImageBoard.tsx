/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useEffect, useState } from "react";
import { SharedMap } from "@fluidframework/map";

export interface ICollaborativeImageBoardProps {
	/**
	 * The SharedString that will store the text from the textarea.
	 */
	map: SharedMap;
}

export const CollaborativeImageBoard: React.FC<ICollaborativeImageBoardProps> = (
	props: ICollaborativeImageBoardProps,
) => {
	const { map } = props;

	const [mapValues, setMapValues] = useState<string[]>([]);

	const handleClick = () => {
		// setText(map);
		const randomKey = Math.floor(Math.random() * 100);
		const randomValue = `https://picsum.photos/id/${randomKey}/200/300`;
		map.set(randomKey.toString(), randomValue.toString());
		// Your code here
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
		const handleValueChanged = (event: any) => {
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
			<h2>Map values:</h2>
			<div style={{ display: "flex", flexWrap: "wrap" }}>
				{Array.from(mapValues.entries()).map(([key, value]) => (
					<div key={key} style={{ margin: "10px" }}>
						<img src={value} alt="" style={{ width: "200px" }} />
						<p>{key}</p>
					</div>
				))}
			</div>
			<button onClick={handleClick}> Random Number </button>
		</div>
	);
};
