"use strict";

const experiment = document.querySelector("[data-experiment]");

if (experiment) {
	const form = experiment.querySelector("[data-experiment-form]");
	const board = experiment.querySelector("[data-experiment-board]");
	const result = experiment.querySelector("[data-experiment-result]");
	const predictionStatus = experiment.querySelector("[data-prediction-status]");
	const predictionButtons = [...experiment.querySelectorAll("[data-prediction]")];
	const resetButton = experiment.querySelector("[data-reset]");
	let prediction = null;

	const getCounts = () => ({
		pigeons: Number(form.elements.pigeons.value),
		holes: Number(form.elements.holes.value)
	});

	const showPredictionResult = (pigeons, holes) => {
		const collisionIsGuaranteed = pigeons > holes;
		const predictionWasCorrect = (prediction === "yes") === collisionIsGuaranteed;
		const answer = collisionIsGuaranteed ? "Yes" : "No";
		const reason = collisionIsGuaranteed
			? `There are ${pigeons} pigeons but only ${holes} holes, so at least one hole must receive more than one pigeon.`
			: `There are enough holes for every pigeon to use a different hole, so repetition is not guaranteed.`;

		predictionStatus.textContent = predictionWasCorrect
			? `Your prediction was correct. ${answer}, two pigeons ${collisionIsGuaranteed ? "must" : "do not have to"} share a hole.`
			: `Your prediction was not correct. ${answer}, two pigeons ${collisionIsGuaranteed ? "must" : "do not have to"} share a hole.`;
		predictionStatus.insertAdjacentText("beforeend", ` ${reason}`);
	};

	const renderResult = (pigeons, holes) => {
		const minimumMaximum = Math.ceil(pigeons / holes);
		const collisionIsGuaranteed = pigeons > holes;
		const explanation = collisionIsGuaranteed
			? `Therefore, at least one hole must contain ${minimumMaximum} or more pigeons.`
			: "Repetition is not guaranteed because there are at least as many holes as pigeons.";

		result.innerHTML = `<p>${pigeons} pigeons, ${holes} holes</p><p>ceil(${pigeons} / ${holes}) = ${minimumMaximum}</p><p>${explanation}</p>`;
		result.hidden = false;
		showPredictionResult(pigeons, holes);
	};

	const renderBoard = (pigeons, holes) => {
		board.replaceChildren();
		const pigeonGroups = Array.from({ length: holes }, () => []);

		for (let pigeonNumber = 1; pigeonNumber <= pigeons; pigeonNumber += 1) {
			pigeonGroups[(pigeonNumber - 1) % holes].push(pigeonNumber);
		}

		pigeonGroups.forEach((group, holeIndex) => {
			const hole = document.createElement("div");
			hole.className = `hole-box${group.length > 1 ? " hole-box--crowded" : ""}`;
			hole.setAttribute("aria-label", `Hole ${holeIndex + 1} contains ${group.length} pigeon${group.length === 1 ? "" : "s"}`);

			const label = document.createElement("span");
			label.className = "hole-label";
			label.textContent = `Hole ${holeIndex + 1}`;
			hole.append(label);

			const pigeonList = document.createElement("div");
			pigeonList.className = "pigeon-list";
			group.forEach((pigeonNumber, groupIndex) => {
				const pigeon = document.createElement("span");
				pigeon.className = "pigeon";
				pigeon.textContent = `P${pigeonNumber}`;
				pigeon.setAttribute("aria-label", `Pigeon ${pigeonNumber}`);
				pigeon.style.animationDelay = `${(pigeonNumber - 1) * 70 + groupIndex * 80}ms`;
				pigeonList.append(pigeon);
			});
			hole.append(pigeonList);

			const count = document.createElement("span");
			count.className = "hole-count";
			count.textContent = `${group.length} pigeon${group.length === 1 ? "" : "s"}`;
			hole.append(count);
			board.append(hole);
		});
	};

	const resetExperiment = () => {
		prediction = null;
		predictionButtons.forEach((button) => {
			button.classList.remove("is-selected");
			button.disabled = false;
		});
		predictionStatus.textContent = "Choose Yes or No before placing the pigeons.";
		board.innerHTML = "<p class=\"board-empty\" data-board-empty>Choose your prediction, then place the pigeons to begin.</p>";
		result.hidden = true;
		result.replaceChildren();
	};

	predictionButtons.forEach((button) => {
		button.addEventListener("click", () => {
			prediction = button.dataset.prediction;
			predictionButtons.forEach((option) => option.classList.toggle("is-selected", option === button));
			predictionStatus.textContent = `Prediction recorded: ${prediction === "yes" ? "Yes" : "No"}. Now place the pigeons.`;
		});
	});

	form.addEventListener("submit", (event) => {
		event.preventDefault();
		if (prediction === null) {
			predictionStatus.textContent = "Choose Yes or No before placing the pigeons.";
			return;
		}

		const { pigeons, holes } = getCounts();
		renderBoard(pigeons, holes);
		renderResult(pigeons, holes);
		predictionButtons.forEach((button) => {
			button.disabled = true;
		});
	});

	resetButton.addEventListener("click", resetExperiment);
}
