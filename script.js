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

const detectiveApp = document.querySelector("[data-detective-app]");

if (detectiveApp) {
	const scenarios = [
		{
			category: "Birth months",
			question: "13 students are in a classroom. What can you guarantee about their birth months?",
			pigeons: "13 students",
			holes: "12 birth months",
			pigeonOptions: ["13 students", "12 birth months", "The classroom", "Their birthdays"],
			holeOptions: ["13 students", "12 birth months", "The classroom", "Their birthdays"],
			explanation: "The students are the objects and the 12 months are the categories. Since 13 students are assigned to 12 months, at least two share a birth month."
		},
		{
			category: "Socks and colors",
			question: "A drawer contains 7 socks in 3 colors. What can you guarantee if you pick all 7 socks?",
			pigeons: "7 socks",
			holes: "3 sock colors",
			pigeonOptions: ["7 socks", "3 sock colors", "The drawer", "Pairs of socks"],
			holeOptions: ["7 socks", "3 sock colors", "The drawer", "Pairs of socks"],
			explanation: "The socks are the objects and their 3 colors are the categories. With 7 socks in 3 colors, at least one color appears at least ceil(7 / 3) = 3 times."
		},
		{
			category: "Birthdays",
			question: "367 people are gathered in a room. What must happen to their birthdays?",
			pigeons: "367 people",
			holes: "366 possible birthdays",
			pigeonOptions: ["367 people", "366 possible birthdays", "The room", "Their names"],
			holeOptions: ["367 people", "366 possible birthdays", "The room", "Their names"],
			explanation: "The people are the objects and the 366 possible calendar dates, including February 29, are the categories. One date must belong to at least two people."
		},
		{
			category: "Integers and remainders",
			question: "Among 8 integers, what can you guarantee about their remainders when divided by 7?",
			pigeons: "8 integers",
			holes: "7 possible remainders",
			pigeonOptions: ["8 integers", "7 possible remainders", "The number 7", "Their differences"],
			holeOptions: ["8 integers", "7 possible remainders", "The number 7", "Their differences"],
			explanation: "The integers are the objects and the remainders 0 through 6 are the 7 categories. Two integers must have the same remainder, so their difference is divisible by 7."
		},
		{
			category: "Hash collisions",
			question: "A hash table has 100 buckets. What must happen when 101 different keys are inserted?",
			pigeons: "101 keys",
			holes: "100 hash buckets",
			pigeonOptions: ["101 keys", "100 hash buckets", "The hash function", "The stored values"],
			holeOptions: ["101 keys", "100 hash buckets", "The hash function", "The stored values"],
			explanation: "The keys are the objects and the buckets are the categories. Since 101 keys are assigned to 100 buckets, at least two keys share a bucket: a hash collision."
		}
	];
	const progress = detectiveApp.querySelector("[data-detective-progress]");
	const category = detectiveApp.querySelector("[data-detective-category]");
	const question = detectiveApp.querySelector("[data-detective-question]");
	const pigeonSelect = detectiveApp.querySelector("[data-detective-pigeons]");
	const holeSelect = detectiveApp.querySelector("[data-detective-holes]");
	const submit = detectiveApp.querySelector("[data-detective-submit]");
	const feedback = detectiveApp.querySelector("[data-detective-feedback]");
	const next = detectiveApp.querySelector("[data-detective-next]");
	const finish = detectiveApp.querySelector("[data-detective-finish]");
	const score = detectiveApp.querySelector("[data-detective-score]");
	const message = detectiveApp.querySelector("[data-detective-message]");
	const restart = detectiveApp.querySelector("[data-detective-restart]");
	let scenarioIndex = 0;
	let detectiveScore = 0;

	const fillSelect = (select, options) => {
		select.replaceChildren(new Option(select === pigeonSelect ? "Choose objects" : "Choose categories", ""));
		options.forEach((option) => select.add(new Option(option, option)));
	};

	const renderScenario = () => {
		const scenario = scenarios[scenarioIndex];
		progress.textContent = `Scenario ${scenarioIndex + 1} of ${scenarios.length}`;
		category.textContent = scenario.category;
		question.textContent = scenario.question;
		fillSelect(pigeonSelect, scenario.pigeonOptions);
		fillSelect(holeSelect, scenario.holeOptions);
		feedback.hidden = true;
		next.hidden = true;
		submit.hidden = false;
		submit.disabled = false;
	};

	const finishDetective = () => {
		detectiveApp.querySelector(".detective-card").hidden = true;
		finish.hidden = false;
		score.textContent = detectiveScore;
		message.textContent = detectiveScore === scenarios.length
			? "Excellent work. You identified every set of objects and categories."
			: detectiveScore >= 3
				? "Good progress. The objects and categories are becoming easier to spot."
				: "Keep practicing. Look for what is being distributed and the categories receiving it.";
	};

	submit.addEventListener("click", () => {
		const scenario = scenarios[scenarioIndex];
		const correct = pigeonSelect.value === scenario.pigeons && holeSelect.value === scenario.holes;
		if (correct) detectiveScore += 1;
		feedback.className = `feedback-panel ${correct ? "feedback-panel--correct" : "feedback-panel--incorrect"}`;
		feedback.innerHTML = `<strong>${correct ? "Correct identification." : "Not quite."}</strong><p><strong>Pigeons:</strong> ${scenario.pigeons}<br><strong>Holes:</strong> ${scenario.holes}</p><p>${scenario.explanation}</p>`;
		feedback.hidden = false;
		submit.disabled = true;
		next.hidden = false;
		next.textContent = scenarioIndex === scenarios.length - 1 ? "See final score" : "Next scenario";
	});

	next.addEventListener("click", () => {
		if (scenarioIndex === scenarios.length - 1) {
			finishDetective();
			return;
		}
		scenarioIndex += 1;
		renderScenario();
	});

	restart.addEventListener("click", () => {
		scenarioIndex = 0;
		detectiveScore = 0;
		detectiveApp.querySelector(".detective-card").hidden = false;
		finish.hidden = true;
		renderScenario();
	});

	renderScenario();
}

const examplesApp = document.querySelector("[data-examples-app]");

if (examplesApp) {
	examplesApp.querySelectorAll("[data-reveal-example]").forEach((button) => {
		button.addEventListener("click", () => {
			const solution = button.parentElement.querySelector("[data-example-solution]");
			solution.hidden = false;
			button.hidden = true;
		});
	});
}

const challengeApp = document.querySelector("[data-challenge-app]");

if (challengeApp) {
	const questions = [
		{ category: "Concept", question: "What are the holes in the classic pigeonhole picture?", options: ["The pigeons", "The containers or categories", "The number of pigeons", "The conclusion"], answer: 1, explanation: "Holes are the containers or categories into which the objects are distributed." },
		{ category: "Concept", question: "If 6 objects go into 5 boxes, what must be true?", options: ["Every box has an object", "One box has at least 2 objects", "Every box has 2 objects", "No box has an object"], answer: 1, explanation: "There are more objects than boxes, so one box must contain at least two objects." },
		{ category: "Application", question: "How many students guarantee that two share a birth month?", options: ["11", "12", "13", "24"], answer: 2, explanation: "There are 12 birth months. One more student, the 13th, guarantees a shared month." },
		{ category: "Generalized principle", question: "If 20 objects are distributed among 6 boxes, what is guaranteed?", options: ["At least 2 in one box", "At least 3 in one box", "At least 4 in one box", "Exactly 4 in every box"], answer: 2, explanation: "ceil(20 / 6) = 4, so at least one box contains 4 or more objects." },
		{ category: "Numbers", question: "Among 11 integers, what is guaranteed about remainders modulo 10?", options: ["All remainders differ", "Two have the same remainder", "Every remainder occurs twice", "No remainder is 0"], answer: 1, explanation: "There are 10 possible remainders and 11 integers, so two integers share a remainder." },
		{ category: "Application", question: "A drawer has socks in 4 colors. How many socks guarantee 2 of one color?", options: ["4", "5", "8", "9"], answer: 1, explanation: "With 4 colors, 5 socks guarantee a repeated color: one more sock than the number of categories." },
		{ category: "Computer science", question: "A system maps 51 keys into 50 hash buckets. What is unavoidable?", options: ["A missing key", "A hash collision", "A new bucket", "A sorted table"], answer: 1, explanation: "More keys than buckets means at least two keys must map to the same bucket." },
		{ category: "Challenge", question: "What is the smallest number of people guaranteeing at least 4 share a birth month?", options: ["36", "37", "48", "49"], answer: 3, explanation: "To avoid 4 in a month, each of the 12 months can hold at most 3 people: 12 x 3 = 36. Person 37 guarantees a fourth in some month." }
	];
	const progress = challengeApp.querySelector("[data-challenge-progress]");
	const category = challengeApp.querySelector("[data-challenge-category]");
	const question = challengeApp.querySelector("[data-challenge-question]");
	const options = challengeApp.querySelector("[data-challenge-options]");
	const submit = challengeApp.querySelector("[data-challenge-submit]");
	const feedback = challengeApp.querySelector("[data-challenge-feedback]");
	const next = challengeApp.querySelector("[data-challenge-next]");
	const finish = challengeApp.querySelector("[data-challenge-finish]");
	const score = challengeApp.querySelector("[data-challenge-score]");
	const message = challengeApp.querySelector("[data-challenge-message]");
	const restart = challengeApp.querySelector("[data-challenge-restart]");
	let questionIndex = 0;
	let challengeScore = 0;

	const renderQuestion = () => {
		const current = questions[questionIndex];
		progress.textContent = `Question ${questionIndex + 1} of ${questions.length}`;
		category.textContent = current.category;
		question.textContent = current.question;
		options.replaceChildren();
		current.options.forEach((option, optionIndex) => {
			const label = document.createElement("label");
			label.className = "quiz-option";
			label.innerHTML = `<input type="radio" name="challenge-answer" value="${optionIndex}"><span>${option}</span>`;
			options.append(label);
		});
		feedback.hidden = true;
		submit.hidden = false;
		submit.disabled = false;
		next.hidden = true;
	};

	submit.addEventListener("click", () => {
		const selected = options.querySelector("input:checked");
		if (!selected) {
			feedback.className = "feedback-panel feedback-panel--notice";
			feedback.textContent = "Choose an option before submitting your answer.";
			feedback.hidden = false;
			return;
		}
		const current = questions[questionIndex];
		const correct = Number(selected.value) === current.answer;
		if (correct) challengeScore += 1;
		options.querySelectorAll("input").forEach((input) => {
			input.disabled = true;
			input.parentElement.classList.toggle("quiz-option--answer", Number(input.value) === current.answer);
		});
		feedback.className = `feedback-panel ${correct ? "feedback-panel--correct" : "feedback-panel--incorrect"}`;
		feedback.innerHTML = `<strong>${correct ? "Correct." : "Not quite."}</strong><p>${current.explanation}</p>`;
		feedback.hidden = false;
		submit.disabled = true;
		next.hidden = false;
		next.textContent = questionIndex === questions.length - 1 ? "See final score" : "Next question";
	});

	next.addEventListener("click", () => {
		if (questionIndex === questions.length - 1) {
			challengeApp.querySelector(".challenge-card").hidden = true;
			finish.hidden = false;
			score.textContent = challengeScore;
			message.textContent = challengeScore === questions.length
				? "Excellent work. You applied the principle consistently."
				: challengeScore >= 5
					? "Solid understanding. Review the explanations for the questions you missed."
					: "Keep practicing the objects-and-holes setup, then try the quiz again.";
			return;
		}
		questionIndex += 1;
		renderQuestion();
	});

	restart.addEventListener("click", () => {
		questionIndex = 0;
		challengeScore = 0;
		challengeApp.querySelector(".challenge-card").hidden = false;
		finish.hidden = true;
		renderQuestion();
	});

	renderQuestion();
}
