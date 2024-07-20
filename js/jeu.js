const questions = [
    { question: 'Quelle est la couleur de Babar ?', answers: ['gris', 'Gris'] },
    { question: 'Quel animal incarne Babar ?', answers: ['éléphant', 'Elephant', 'Éléphant', 'elephant'] },
    { question: 'Quel est le meilleur amis de Babar ?', answers: ['Giraffe', 'giraffe', 'girafe', 'Girafe'] }
];

let currentQuestionIndex = 0;
let score = 0;

document.addEventListener('DOMContentLoaded', () => {
    loadQuestion();
    document.getElementById('submit-button').addEventListener('click', checkAnswer);
    document.getElementById('answer-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });
});

function loadQuestion() {
    if (currentQuestionIndex < questions.length) {
        document.getElementById('question').textContent = questions[currentQuestionIndex].question;
    } else {
        document.getElementById('question-box').innerHTML = `<p>Vous avez terminé le jeu ! Votre score final est ${score}/20. <br> Vous pouvez retourner à l'acceuil ici : <br> <br> <button src="acceuil.html"><a href="acceuil.html">Acceuil</a></button></p>`;
    }
}

function checkAnswer() {
    const userAnswer = document.getElementById('answer-input').value.trim().toLowerCase();
    const correctAnswer = questions[currentQuestionIndex].answers[0].toLowerCase();
    if (userAnswer.includes(correctAnswer)) {
        score++;
        document.getElementById('score').textContent = score;
    }
    currentQuestionIndex++;
    document.getElementById('answer-input').value = '';
    loadQuestion();
}
