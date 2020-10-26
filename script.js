// Pages
const gamePage = document.getElementById('game-page');
const scorePage = document.getElementById('score-page');
const splashPage = document.getElementById('splash-page');
const countdownPage = document.getElementById('countdown-page');
// Splash Page
const startForm = document.getElementById('start-form');
const radioContainers = document.querySelectorAll('.radio-container');
const radioInputs = document.querySelectorAll('input');
const bestScores = document.querySelectorAll('.best-score-value');
// Countdown Page
const countdown = document.querySelector('.countdown');
// Game Page
const itemContainer = document.querySelector('.item-container');
// Score Page
const finalTimeEl = document.querySelector('.final-time');
const baseTimeEl = document.querySelector('.base-time');
const penaltyTimeEl = document.querySelector('.penalty-time');
const playAgainBtn = document.querySelector('.play-again');
const score = document.querySelector('.score-number');

let correct = 0;
let wrong = 0;

// Equations
let questionAmount = 0;
let equationsArray = [];
let playerGuessArray = [];
let bestScoreArray = [];

// Game Page
let firstNumber = 0;
let secondNumber = 0;
let equationObject = {};
const wrongFormat = [];

// Time
let timer;
let timePlayed = 0;
let baseTime = 0;
let penaltyTime = 0;
let finalTime = 0;
let finalTimeDisplay = '0.0';

// Scroll
let valueY = 0;

//add best scors to the splash page
function bestScoresToDOM() {
	bestScores.forEach((element, index) => {
		element.textContent = `${bestScoreArray[index].bestScore}s`;
	});
}

//check loacl storage for best score and set best score
function getSavedBestScores() {
	if (localStorage.getItem('bestScores')) {
		bestScoreArray = JSON.parse(localStorage.getItem('bestScores'));
	} else {
		bestScoreArray = [
			{ questions: 10, bestScore: finalTimeDisplay },
			{ questions: 25, bestScore: finalTimeDisplay },
			{ questions: 50, bestScore: finalTimeDisplay },
			{ questions: 99, bestScore: finalTimeDisplay },
		];
		localStorage.setItem('bestScores', JSON.stringify(bestScoreArray));
	}
	bestScoresToDOM();
}

//update best score to the array
function updateBestScore() {
	bestScoreArray.forEach((score, index) => {
		//select correct best score to update
		if (questionAmount == score.questions) {
			//return best score with one decimal number
			const savedBestScore = Number(bestScoreArray[index].bestScore);
			//upadate if the final score is less or equal to zero
			if (savedBestScore === 0 || savedBestScore > finalTime) {
				bestScoreArray[index].bestScore = finalTimeDisplay;
			}
		}
	});
	//update splash page
	bestScoresToDOM();
	//save to loacl storage
	localStorage.setItem('bestScores', JSON.stringify(bestScoreArray));
}

//resae the game
function playAgain() {
	gamePage.addEventListener('click', startTimer);
	scorePage.hidden = true;
	splashPage.hidden = false;
	equationsArray = [];
	playerGuessArray = [];
	valueY = 0;
}

//show score page
function showScorePage() {
	//show play again button after 1s
	setTimeout(() => {
		playAgainBtn.hidden = false;
	}, 1000);

	gamePage.hidden = true;
	scorePage.hidden = false;
}

//Formet and display time score in dom
function scoresToDom() {
	finalTimeDisplay = finalTime.toFixed(1);
	score.textContent = `Correct: ${correct} - Wrong: ${wrong}`;
	baseTime = timePlayed.toFixed(1);
	penaltyTime = penaltyTime.toFixed(1);
	baseTimeEl.textContent = `Base Time: ${baseTime}s`;
	penaltyTimeEl.textContent = `Penalty: +${penaltyTime}s`;
	finalTimeEl.textContent = `${finalTimeDisplay}s`;
	//best score update
	updateBestScore();
	//scroll to top, go to score page
	itemContainer.scrollTo({ top: 0, bahavior: 'instant' });
	showScorePage();
}

//stop timer, process results and goto score page
function checkTime() {
	if (playerGuessArray.length == questionAmount) {
		clearInterval(timer);
		equationsArray.forEach((equation, index) => {
			if (equation.evaluated === playerGuessArray[index]) {
				//correct guess
				console.log('anik');
			} else {
				//incorrect guess
				penaltyTime += 0.5;
			}
		});
		finalTime = timePlayed + penaltyTime;
		scoresToDom();
	}
}

//add 10th of a second to timeplayed
function addTime() {
	timePlayed += 0.1;
	checkTime();
}

//start timer when game page is clicked
function startTimer() {
	//reset times
	timePlayed = 0;
	penaltyTime = 0;
	finalTime = 0;
	timer = setInterval(addTime, 100);
	gamePage.removeEventListener('click', startTimer);
}

//scroll store user selection in playeGuessArray
function select(guess) {
	//scroll vertically 80px
	valueY += 80;

	itemContainer.scroll(0, valueY);

	//add guess to array
	return guess ? playerGuessArray.push(true) : playerGuessArray.push(false);
}

//display game page
function showGamePage() {
	gamePage.hidden = false;
	countdownPage.hidden = true;
}

//get random number up to a max number
function getRandomNumber(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

// Create Correct/Incorrect Random Equations
function createEquations() {
	//Randomly choose how many correct equations there should be
	const correctEquations = getRandomNumber(questionAmount);
	correct = correctEquations;

	//Set amount of wrong equations
	const wrongEquations = questionAmount - correctEquations;
	wrong = wrongEquations;

	//Loop through, multiply random numbers up to 9, push to array
	for (let i = 0; i < correctEquations; i++) {
		firstNumber = getRandomNumber(9);
		secondNumber = getRandomNumber(9);
		const equationValue = firstNumber * secondNumber;
		const equation = `${firstNumber} x ${secondNumber} = ${equationValue}`;
		equationObject = { value: equation, evaluated: true };
		equationsArray.push(equationObject);
	}

	//Loop through, mess with the equation results, push to array
	for (let i = 0; i < wrongEquations; i++) {
		firstNumber = getRandomNumber(9);
		secondNumber = getRandomNumber(9);
		const equationValue = firstNumber * secondNumber;
		if (firstNumber === 0 && equationValue === 0) {
			wrongFormat[0] = `${firstNumber} x ${secondNumber + 1} = ${
				secondNumber + 1
			}`;
		} else {
			wrongFormat[0] = `${firstNumber} x ${
				secondNumber + 1
			} = ${equationValue}`;
		}
		wrongFormat[1] = `${firstNumber} x ${secondNumber} = ${equationValue - 1}`;
		wrongFormat[2] = `${firstNumber + 1} x ${secondNumber} = ${equationValue}`;
		const formatChoice = getRandomNumber(2);
		const equation = wrongFormat[formatChoice];
		equationObject = { value: equation, evaluated: false };
		equationsArray.push(equationObject);
	}
	shuffle(equationsArray);
}

//equations to dom
function equationsToDOM() {
	equationsArray.forEach((equation) => {
		//item
		const item = document.createElement('div');
		item.classList.add('item');

		//equation text

		const equationText = document.createElement('h1');
		equationText.textContent = equation.value;

		//append
		item.appendChild(equationText);
		itemContainer.appendChild(item);
	});
}

// Dynamically adding correct/incorrect equations
function populateGamePage() {
	// Reset DOM, Set Blank Space Above
	itemContainer.textContent = '';
	// Spacer
	const topSpacer = document.createElement('div');
	topSpacer.classList.add('height-240');
	// Selected Item
	const selectedItem = document.createElement('div');
	selectedItem.classList.add('selected-item');
	// Append
	itemContainer.append(topSpacer, selectedItem);

	// Create Equations, Build Elements in DOM
	createEquations();
	equationsToDOM();

	// Set Blank Space Below
	const bottomSpacer = document.createElement('div');
	bottomSpacer.classList.add('height-500');
	itemContainer.appendChild(bottomSpacer);
}

// display 3,2,1 go and navigate to game page
function countdownStart() {
	let count = 3;
	countdown.textContent = count;
	const timeCountdown = setInterval(() => {
		count--;
		if (count === 0) {
			countdown.textContent = 'Go!';
		} else if (count === -1) {
			showGamePage();
			clearInterval(timeCountdown);
		} else {
			countdown.textContent = count;
		}
	}, 1000);
}

//navigate from splahs page to countdodn page
function showCountdown() {
	countdownPage.hidden = false;
	splashPage.hidden = true;
	populateGamePage();
	countdownStart();
}

//get the value from selected radio button
function getRadioValue() {
	let result;
	radioInputs.forEach((radioInput) => {
		if (radioInput.checked) {
			result = radioInput.value;
		}
	});
	return result;
}

//decide the question
function selectQuestionAmount(e) {
	e.preventDefault();
	questionAmount = getRadioValue();
	if (questionAmount) {
		showCountdown();
	}
}

//event listeners
startForm.addEventListener('click', () => {
	radioContainers.forEach((radioEl) => {
		//remove selected label style
		radioEl.classList.remove('selected-label');
		//add the label style if the radio input in checked
		if (radioEl.children[1].checked) {
			radioEl.classList.add('selected-label');
		}
	});
});

//on submit event listener
startForm.addEventListener('submit', selectQuestionAmount);
gamePage.addEventListener('click', startTimer);

//on load
getSavedBestScores();
