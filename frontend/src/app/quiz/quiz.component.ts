import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-quiz',
  imports: [NgIf, NgFor],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.css'
})
export class QuizComponent implements OnInit {

  id: string = '';//beégetés kiszedése folyamatban...
  questions: any[] = [];
  currentQuestionIndex: number = 0;
  correctAnswer: string = '';
  score: number = 0;
  quizFinished: boolean = false;
  timeLeft: number = 20;
  timer: any;
  answerRevealed: boolean = false;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.getQuestions();
  }

  getQuestions(): void {
    this.apiService.getQuestionsById(this.id).subscribe(
      (response) => {
        if (response.questions && response.questions.length > 0) {
          this.questions = response.questions.map((q: [string, string]) => ({
            question: q[0], 
            answer: q[1]
          }));

          this.shuffleQuestions();
          this.startTimer();
        } else {
          console.log('Nincsenek kérdések!');
        }
      },
      (error) => {
        console.error('Hiba történt a kérdések lekérésekor:', error);
      }
    );
  }

  shuffleQuestions(): void {
    for (let i = this.questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.questions[i], this.questions[j]] = [this.questions[j], this.questions[i]];
    }
  }

  startTimer(): void {
    this.timeLeft = 20;
    this.answerRevealed = false; 
    if (this.timer) clearInterval(this.timer);

    this.timer = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.timeUp();
      }
    }, 1000);
  }

  answerQuestion(selectedAnswer: string): void {
    if (this.answerRevealed) return;

    clearInterval(this.timer);
    this.correctAnswer = this.questions[this.currentQuestionIndex].answer;
    this.answerRevealed = true;

    if (selectedAnswer === this.correctAnswer) {
      this.score++;
    }

    setTimeout(() => this.nextQuestion(), 2000);
  }

  timeUp(): void {
    clearInterval(this.timer);
    this.correctAnswer = this.questions[this.currentQuestionIndex].answer;
    this.answerRevealed = true;
    setTimeout(() => this.nextQuestion(), 2000);
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.correctAnswer = '';
      this.answerRevealed = false;
      this.startTimer();
    } else {
      this.finishQuiz();
    }
  }

  finishQuiz(): void {
    clearInterval(this.timer);
    this.quizFinished = true;
  }



}
